import express from 'express';
import { AppDataSource, createAdmin, seedDatabase } from './src/database/data-source';
import { createUserAndDatabase } from "./src/database/db.create";
import userRoutes from './src/routes/user.routes';
import callBackRoutes from './src/routes/callback.routes';
import eventRoutes from './src/routes/event.routes';
import companyRoutes from './src/routes/company.routes';
import themeRoutes from './src/routes/theme.routes';
import formatRoutes from './src/routes/format.routes';
import commentRoutes from './src/routes/comment.routes';
import ticketRoutes from './src/routes/ticket.routes'
import promocodeRoutes from './src/routes/promo.routes'
import subscriptionRoutes from './src/routes/subscription.routes'
import authRoutes from './src/routes/auth.routes'
import paymentRoutes from './src/routes/payment.routes'
import { createAdminRouter } from './src/utils/admin';
import cors from 'cors';
import path from 'path';
import './src/utils/notificationScheduler';

export const app = express();
const PORT = process.env.PORT;

const allowedOrigins = [
	'http://localhost:3000',
	'http://localhost:8000',
];

const corsOptions = {
	origin: function (origin, callback) {
		if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
			callback(null, true);
		} else {
			callback(new Error('Not allowed by CORS'));
		}
	},
	credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/themes', themeRoutes);
app.use('/api/formats', formatRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/promocodes', promocodeRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/auth', authRoutes);
app.use('/avatars', express.static(path.join(__dirname, 'uploads')));
app.use('/auth', callBackRoutes);

createUserAndDatabase()
	.then(() => {
		AppDataSource.initialize()
			.then(async () => {
				await seedDatabase();
				const adminRouter = await createAdminRouter();
				app.use('/admin', adminRouter);

				app.listen(PORT, () => {
					console.log(`Server is running on http://localhost:${PORT}`);
				});
			})
			.catch(error => {
				console.error('Error during Data Source initialization:', error);
			});
	})
	.catch(error => {
		console.error('Error during database creation:', error);
	});
