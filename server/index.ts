import express from 'express';
import { AppDataSource, createDatabaseIfNotExists, createAdmin, seedDatabase, seedLocalEvents, seedLocalEventsForCountry, createLocalDump, restoreLocalDump, localEventsBackup } from './src/database/data-source';
import { createUserAndDatabase } from "./src/database/db.create";
import userRoutes from './src/routes/user.routes';
import eventRoutes from './src/routes/event.routes';
import calendarRoutes from './src/routes/calendar.routes';
import authRoutes from './src/routes/auth.routes'
import cors from 'cors';
import fs from "fs";
import path from "path";

export const app = express();
const PORT = process.env.PORT;

const allowedOrigins = [
	'http://localhost:3000',
	// `http://${IP}:3000`,
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

// Connect routes
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/calendars', calendarRoutes);
app.use('/api/auth', authRoutes);
const checkAndRunKostilSQL = async () => {
	try {
		const result = await AppDataSource.query(`
			SELECT column_name 
			FROM information_schema.columns 
			WHERE table_name = 'calendar_users' AND column_name = 'rights'
		`);

		if (result.length > 0) {
			console.log("✅ 'kostil.sql' already applied. Skipping.");
			return;
		}

		console.log("⚙️ Running kostil.sql...");
		const sqlFilePath = path.join(__dirname, "src/database/kostil.sql");
		const sql = fs.readFileSync(sqlFilePath, "utf-8");

		await AppDataSource.query(sql);
		console.log("✅ kostil.sql executed successfully.");
	} catch (error) {
		console.error("❌ Error applying kostil.sql:", error);
	}
};

// Create the database if it doesn't exist, then initialize the data source and start the server
createUserAndDatabase()
	.then(() => {
		AppDataSource.initialize()
			.then(async () => {
				
				// await checkAndRunKostilSQL();
				
				// console.log('Data Source has been initialized!');
				await createAdmin();
				
				
				// await localEventsBackup();
				
				await seedLocalEvents();
				await seedDatabase();
				
				
				// createLocalEventDump();
				// restoreLocalEventDump();

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
