import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../models/User';
import { Event } from '../models/Event';
import { Calendar } from '../models/Calendar';
// import { EventUser } from '../models/EventUser'; // Убедитесь, что сущность импортирована
// import { CalendarUser } from '../models/CalendarUser';
import { Client } from 'pg';
import { UserSubscriber } from '../utils/userSubscriver';
import { faker, tr } from '@faker-js/faker';
import fs from 'fs';
import csv from 'csv-parser';
import axios from 'axios';
import { exec, execSync } from "child_process"
// import { Permission } from '../models/Permission_huy';
import { Permission } from '../models/Permission';
require('dotenv').config();

const FAKER_USERS = 5;
const FAKER_CALENDARS = 5;
const FAKER_EVENTS = 5;

export const AppDataSource = new DataSource({
	type: 'postgres',
	host: process.env.DB_HOST,
	port: Number(process.env.DB_PORT),
	username: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	synchronize: true,
	logging: false,
	entities: [Event, Calendar, User, Permission],
	migrations: [],
	subscribers: [UserSubscriber],
});

export const createDatabaseIfNotExists = async () => {
	const client = new Client({
		host: 'localhost',
		port: 5432,
		user: 'postgres', // Replace with your username
		password: process.env.DB_PASS, // Replace with your password
		database: 'postgres', // Connect to the default database to create the new one
	});

	try {
		await client.connect();

		const result = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${process.env.DB_NAME}'`);

		if (result.rows.length === 0) {
			await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
			console.log(`Database '${process.env.DB_NAME}' has been created!`);
		} else {
			console.log(`Database '${process.env.DB_NAME}' already exists.`);
		}
	} catch (error) {
		console.error('Error while checking/creating the database:', error);
	} finally {
		await client.end();
	}
};

export const createAdmin = async () => {
	try {
		console.log('Creating admin user...');

		const existingAdmin = await User.findOne({ where: { email: "admin@example.com" } });
		if (existingAdmin) {
			console.log('Admin user already exists. Skipping creation.');
			return; 
		}

		const adminUser = User.create({
			login: 'admin',
			fullName: 'Admin',
			email: 'admin@example.com',
			password: 'admin',
			isEmailConfirmed: true,
		});

		await User.save(adminUser);
		console.log('Admin user created with id 0');
	} catch (error) {
		console.error('Error creating admin user:', error.message || error);
	}
};

export const seedDatabase = async () => {
	try {
		console.log('Data source has been initialized. Starting to seed...');

		const userCount = await User.count();
		const calendarCount = await Calendar.count();
		const eventCount = await Event.count();

		let users = [];

		if (userCount >= FAKER_USERS) {
			console.log('Users table is not empty. Skipping user creation.');
			users = await User.find();
		} else {
			console.log('Creating users...');
			for (let i = userCount; i < FAKER_USERS; i++) {
				const user = User.create({
					login: faker.internet.username(),
					fullName: faker.person.fullName(),
					email: faker.internet.email(),
					password: faker.internet.password(),
				});
				await user.save();
				users.push(user);
			}
			console.log(`Created ${users.length} users.`);
		}

		let calendars = [];
		if (calendarCount >= FAKER_CALENDARS) {
			console.log('Calendars table is not empty. Skipping calendar creation.');
			calendars = await Calendar.find();
		} else {
			console.log('Creating calendars...');
			for (let i = calendarCount; i < FAKER_CALENDARS; i++) {
				const userID = Math.floor(Math.random() * users.length);
				const calendar = Calendar.create({
					name: `Calendar ${i + 1}`,
					description: faker.lorem.sentence(),
					// users: [users[userID], users[(userID + 1) % users.length]],
				});
				await calendar.save();
				const ownerPermission = Permission.create({
					user: users[userID],
					calendar: calendar,
					role: "owner"
				});
				await ownerPermission.save();
				calendars.push(calendar);
			}
			console.log(`Created ${calendars.length} calendars.`);
		}

		if (eventCount >= FAKER_EVENTS) {
			console.log('Events table is not empty. Skipping event creation.');
		} else {
			console.log('Creating events...');
			const events = [];
			for (let i = eventCount; i < FAKER_EVENTS; i++) {
				const calendar = calendars[i % calendars.length];
				const startDate = faker.date.future();
				const endDate = faker.date.future({ refDate: startDate });

				const event = Event.create({
					title: faker.lorem.words(3),
					description: faker.lorem.sentence(),
					startDate,
					endDate,
					calendar,
				});
				await event.save();
				events.push(event);
			}
			console.log(`Created ${events.length} events.`);
		}

		console.log('Database has been seeded successfully.');
	} catch (error) {
		console.error('Error seeding database:', error.message || error);
	}
};

const getCountriesFromCSV = async (): Promise<string[]> => {
	return new Promise((resolve, reject) => {
		const countries: Set<string> = new Set();

		fs.createReadStream('cal.csv')
			.pipe(csv())
			.on('data', (data) => {
				const country = data['Religion/Country'];
				if (country) {
					countries.add(country);
				}
			})
			.on('end', () => {
				resolve(Array.from(countries));
			})
			.on('error', (err) => reject(err));
	});
};

async function getCalendarId(location: string): Promise<string | null> {
	return new Promise((resolve, reject) => {
		const results: Record<string, string>[] = [];

		fs.createReadStream('cal.csv')
			.pipe(csv())
			.on('data', (data) => results.push(data))
			.on('end', () => {
				const row = results.find((row) => row['Religion/Country'] === location);
				if (row) {
					const calendarId = row['calendarID'];
					if (calendarId) {
						resolve(calendarId);
					} else {
						resolve(process.env.CAL_ID || null);
					}
				} else {
					resolve(null);
				}
			})
			.on('error', (err) => reject(err));
	});
}

const getEventsByCalendarId = async (calendarId: string): Promise<any[]> => {
	try {
		const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${process.env.API_KEY}`;
		const response = await axios.get(url);
		return response.data.items || [];
	} catch (error) {
		console.error(`Error fetching events for calendar ID ${calendarId}:`, error.message);
		return [];
	}
};

const processEvents = (items: any[]) => {
	const groupedEvents: Record<string, { description: string, dates: string[] }> = {};
	const postfixRegex = /\s*(\([^)]+\)|observed|\(tentative\)|Suspended)+/g;

	items.forEach((item) => {
		const { summary, description, start } = item;
		const cleanedSummary = summary.replace(postfixRegex, '').trim();

		if (!groupedEvents[cleanedSummary]) {
			groupedEvents[cleanedSummary] = { description, dates: [] };
		}

		groupedEvents[cleanedSummary].dates.push(start.date);
	});

	return groupedEvents;
};

export const seedLocalEvents = async () => {
	try {
		console.log('Seeding local events...');

		const countries = await getCountriesFromCSV();

		for (const country of countries) {
			const existingCalendar = await Calendar.findOne({ where: { name: `Holidays in ${country}` } });
			if (existingCalendar) {
				// console.log(`Calendar for ${country} already exists. Skipping.`);
				continue;
			}

			const calendarId = await getCalendarId(country);
			if (!calendarId) {
				// console.log(`No calendar found for location: ${country}`);
				continue;
			}

			const events = await getEventsByCalendarId(calendarId);
			if (!events) {
				// console.log(`No events found for calendar ID: ${calendarId}`);
				continue;
			}

			const groupedEvents = processEvents(events);

			await createCalendarAndEvents(country, groupedEvents);
			console.log(`Calendar succesfuly created for location: ${country}`);
			// break;
		}
		console.log('Seeding completed successfully.');
	} catch (error) {
		console.error('Error seeding local events:', error.message || error);
	}
};

const createCalendarAndEvents = async (country: string, groupedEvents: Record<string, { description: string, dates: string[] }>) => {
	const admin = await User.findOne({ where: { email: 'admin@example.com' } });
	const countryCalendar = await Calendar.create({
		name: `Holidays in ${country}`,
		description: `Holidays and events for ${country}`,
		// users: [admin]
	});
	await countryCalendar.save(); // Сохраняем календарь
	const ownerPermission = Permission.create({
		user: admin,
		calendar: countryCalendar,
		role: "owner"
	});
	await ownerPermission.save();
	// await countryCalendar.updateUserRole(admin, "owner");
	// countryCalendar

	for (const [eventTitle, eventData] of Object.entries(groupedEvents)) {
		const { description, dates } = eventData;

		for (let date of dates) {
			const event = Event.create({
				title: eventTitle,
				description: description,
				startDate: new Date(date),
				endDate: new Date(date),
				calendar: countryCalendar,
				type: 'arrangement'
			});
			await event.save(); // Сохраняем событие
			// console.log(`Created event: ${eventTitle} for ${country} on ${date}`);
		}
	}
};

export const seedLocalEventsForCountry = async (country) => {
    try {
        console.log(`Seeding local events for ${country}...`);

        const existingCalendar = await Calendar.findOne({ where: { name: `Holidays in ${country}` } });
        if (existingCalendar) {
            console.log(`Calendar for ${country} already exists. Skipping.`);
            return;
        }

        const calendarId = await getCalendarId(country);
        if (!calendarId) {
            console.log(`No calendar found for location: ${country}`);
            return;
        }

        const events = await getEventsByCalendarId(calendarId);
        if (!events || events.length === 0) {
            console.log(`No events found for calendar ID: ${calendarId}`);
            return;
        }

        const groupedEvents = processEvents(events);
        await createCalendarAndEvents(country, groupedEvents);
        
        console.log(`Calendar successfully created for location: ${country}`);
    } catch (error) {
        console.error(`Error seeding local events for ${country}:`, error.message || error);
    }
};


export const updateOwnerIdInDump = (adminId) => {
    let dumpContent = fs.readFileSync("my_dump.sql", "utf8");

    const lines = dumpContent.split('\n').slice(23, 261);

    lines.forEach((line, index) => {
        let tmp = line.split(',');

        if (tmp.length > 6) {
            tmp[6] = ` '${adminId}');`;
            lines[index] = tmp.join(',');
        }
    });

    let updatedContent = lines.join('\n');

    dumpContent = dumpContent.split('\n').slice(0, 22).join('\n') + '\n' + updatedContent + '\n' + dumpContent.split('\n').slice(261).join('\n');

    fs.writeFileSync("my_dump.sql", dumpContent);
    console.log("ownerId успешно заменён!");
};

export const createLocalDump = async () => {
	console.log("Creating dump...");
	exec("pg_dump --column-inserts --data-only --table=calendar --table=event CloOk > my_dump.sql");
	console.log("Dump created succesfully!");
};
export const restoreLocalDump = async () => {
	console.log("Restoring dump...");

	const userRepository = AppDataSource.getRepository(User);
	const admin = await userRepository.findOne({ where: { email: 'admin@example.com' } });

	if (!admin) {
		console.error("Admin user not found!");
		return;
	}

	const adminId = admin.id;
	await updateOwnerIdInDump(adminId);
	execSync("psql CloOk -f my_dump.sql -q");

	console.log("Dump restored successfully!");
};

export const localEventsBackup = async () => {
	const isDump = fs.existsSync('my_dump.sql')
	const calendarRepository = AppDataSource.getRepository(Calendar);
	const calendarCount = await calendarRepository.count();
	if (calendarCount < 237) {
		isDump ? await restoreLocalDump() : await seedLocalEvents();
	}
	if (!isDump) {
		// console.log("SACHEMMMMMM");
		await createLocalDump();
	}
	if (calendarCount >= 237 && isDump) console.log("Nothing to do!")
};
