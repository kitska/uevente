# Copilot Instructions for uevente

## Architecture Overview

**uevente** is a full-stack event management platform with three major services:
- **Client** (React 19 + Vite): Frontend on port 3000
- **Server** (Node.js/Express + TypeScript): Backend on port 8000  
- **Database** (PostgreSQL): Data layer in Docker
- **AI Server** (Optional Ollama integration): Event embeddings and semantic search

Data flows: Client → Axios (with JWT interceptor) → Server API (/api/*) → TypeORM entities → PostgreSQL

## Key Architectural Patterns

### Client: MobX State Management + React Router
- **State**: `userStore` (MobX) is the single source of truth for auth/user state. Never use React Context for persistent user data.
- **Routing**: React Router v7 wraps authenticated pages with `ProtectedRoute`; Header/Footer conditionally hide on certain routes (login, register, account, password-reset)
- **HTTP**: Axios instance in `services/index.js` with request interceptor that auto-attaches JWT token and validates email confirmation

Example: User login flow:
1. `userStore.login(email, password, login)` in Login.jsx
2. Service calls `getUser()` which posts to `/api/auth/user`
3. Interceptor stores token in localStorage and sets Authorization header
4. On 401, auto-logout and redirect to /login

### Server: Service-Controller-Route Pattern
Routes → Controllers (business logic/response formatting) → Services (database operations) → TypeORM Models

Each entity gets:
- **Model** in `src/models/` (User.ts, Event.ts, etc.) - TypeORM entities with `@Column`, `@ManyToOne`, `@OneToMany`
- **Controller** in `src/controllers/` - Static methods for HTTP handlers, import Models directly
- **Routes** in `src/routes/` - Router definitions with `.bind(Controller)` pattern
- Example: `EventController.getEventById()` imports Event model, uses `Event.findOne()`, returns JSON

### Database Entities & Relationships
Key models in `src/models/`:
- **User** - email, password (bcrypted), login, profilePicture, isEmailConfirmed, isAdmin, rating
- **Event** - title, description, price, ticket_limit, company (FK), theme (FK), format (FK), date, location
- **Subscription** - user + (event OR company) FK relationship (polymorphic pattern)
- **Payment** - stripe integration, user + event
- **Ticket** - user + event (attendance proof)
- **Comment** - user + event + text

## Development Workflows

### Setup & Installation
```bash
# Root level (monorepo):
npm run install      # Installs both client and server
npm start            # Concurrently runs client:dev + server:dev

# Individual services:
cd server && npm run dev    # Watch mode on port 8000
cd client && npm run dev    # Vite hot reload on port 3000
```

### Database Management
```bash
cd server
npm run db:create    # Initialize schema
npm run db:fill      # Seed with faker data
npm run db:drop      # Reset database
```
Environment: Set `.env` in `/server` with DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT SECRET_KEY, external API keys (Stripe, Imgur, Twilio, VAPID for push notifications).

### Testing
```bash
cd server
npm test             # Jest with ts-jest (--runInBand)
```
Tests in `server/tests/`, using `.test.ts` suffix. Setup file: `jest.setup.ts`.

### Docker (Production)
```bash
./docker/docker-run.sh   # Builds and runs containers
docker-compose down      # Cleanup
```

## Project-Specific Conventions

### Authentication Flow
- **Email Confirmation**: First-time users get email link. Server checks `isEmailConfirmed` before allowing API calls (client interceptor blocks unconfirmed users with SweetAlert warning).
- **OAuth Integration**: Google, GitHub, Discord supported. userStore handles account creation on first login (converts email/provider ID to password via `#passwordPrikol()` method - quirky but functional).
- **JWT Token**: Stored in localStorage, auto-refreshed via interceptor on 401.

### Event Subscriptions
- Users can subscribe to **events** OR **companies** (not both simultaneously for same entity).
- `userStore.subscriptions` array tracks both types; query method `isEventSubscribed(id)` checks polymorphic relationship.
- Subscription model: `{ id, event?: Event, company?: Company, user: User }`

### File Upload Pattern
- **Images**: Use Imgur API (`EventController.uploadToImgur()`) for event posters. Set IMGUR_CLIENT_ID in .env.
- **QR Codes**: Server generates via `qrcode` package for tickets in `/uploads/qrcodes/`.
- **Multipart**: Use `multer` middleware (see event.routes.ts: `upload.single('file')`).

### API Response Format
Controllers return standardized JSON:
```javascript
// Success
res.status(200).json({ message, data: object })

// Error
res.status(400).json({ error: "message" })
res.status(401).json({ message: "Unauthorized" })
```
Client catches errors via Axios interceptor; 401 triggers logout.

### External Integrations
- **Stripe**: Payment controller handles sessions and webhook confirmations.
- **Email**: `sendEmail()` utility uses Nodemailer (EMAIL_USER, EMAIL_PASS from .env).
- **Twilio**: SMS notifications for events (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN).
- **Push Notifications**: Web push via `web-push` package (VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY) + Service Worker registered in client/public.

### UI Framework & Styling
- **Frontend**: React 19 with Tailwind CSS (vite plugin) + Material-UI components + FontAwesome icons.
- **Animations**: AOS (Animate On Scroll) with fade/zoom effects; Framer Motion for advanced transitions.
- **Toast Notifications**: react-hot-toast (top-right position).
- **Theme Toggle**: ThemeContext (see components/ThemeToggleButton.jsx).

### Component Structure (Client)
- **Pages** (src/pages/): Full route pages (Event.jsx, Account.jsx, Main.jsx)
- **Components** (src/components/): Reusable UI (EventCard.jsx, Header.jsx, ProtectedRoute.jsx)
- **Services** (src/services/): API calls via axios (eventService.js, userService.js)
- **Store** (src/store/): MobX state management (userStore, filterStore, eventStore)
- **Utils** (src/utils/): Helpers (oauth.js)

## Critical File References

**Server Key Files**:
- `index.ts` - Express app setup, CORS config, route mounting, database initialization
- `src/database/data-source.ts` - TypeORM connection, seeding logic
- `src/models/User.ts` - User entity (study relationship patterns here)
- `src/controllers/EventController.ts` - Example controller (1200+ lines, reference for patterns)
- `src/services/userService.ts` - Service layer example

**Client Key Files**:
- `App.jsx` - Router, Axios interceptor setup, conditional Header/Footer rendering
- `store/userStore.js` - MobX observable store (study `makeAutoObservable`, `runInAction`)
- `services/index.js` - Axios instance + request/response interceptors
- `components/ProtectedRoute.jsx` - Auth gate component
- `vite.config.js` - Tailwind + React plugin setup

## Common Pitfalls & Best Practices

1. **Auth**: Always check `userStore.user` exists before API calls; token auto-expires per TOKEN_EXPIRES (default 1h).
2. **CORS**: Allowed origins hardcoded in index.ts (localhost:3000, localhost:8000); update for production.
3. **Database**: TypeORM `synchronize: true` auto-migrates schema; disable in production and use explicit migrations.
4. **MobX**: Use `makeAutoObservable()` for auto-tracked state; wrap async operations in `runInAction()`.
5. **Services**: Always import Models directly in controllers; service layer used sparingly (mostly in userService).
6. **Error Handling**: Wrap controller methods in try-catch; log errors to console.error before responding.
7. **Types**: Server uses TypeScript; client uses JSX (not TypeScript) - keep ES6 import/export patterns.

## AI Agent Productivity Tips

- Start by reading `index.ts` (server) and `App.jsx` (client) to understand entry points.
- Study `EventController.ts` for controller patterns; it's the most comprehensive example.
- Check `userStore.js` to understand MobX observable state management.
- Use `.bind(this)` pattern when registering route handlers (see event.routes.ts).
- For new features: create Model → define relationships → add Controller method → register route → call from client service.
- If adding new entity: follow User.ts or Event.ts as entity template, mirror in controllers + routes + client services.
