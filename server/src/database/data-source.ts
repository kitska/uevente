import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Client } from 'pg';
import { faker } from '@faker-js/faker';
require('dotenv').config();
import path from 'path';
import { User } from '../models/User';
import { Event } from '../models/Event';
import { Company } from '../models/Company';
import { Format } from '../models/Format';
import { Notification } from '../models/Notification';
import { Comment } from '../models/Comment';
import { Payment } from '../models/Payment';
import { Promocode } from '../models/Promocode';
import { Subscription } from '../models/Subscription';
import { Theme } from '../models/Theme';
import { Ticket } from '../models/Ticket';

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
	// entities: [User, Event, Comment, Company, Promocode, Notification, Subscription, Theme, Format, Ticket, Payment],
	entities: [path.join(__dirname, "../models/*.{ts,js}")],
	migrations: [],
	subscribers: [],
});

export const createDatabaseIfNotExists = async () => {
	const client = new Client({
		host: 'localhost',
		port: 5432,
		user: 'postgres',
		password: process.env.DB_PASS,
		database: 'postgres',
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
	// try {
	// 	console.log('Creating admin user...');

	// 	const existingAdmin = await User.findOne({ where: { email: "admin@example.com" } });
	// 	if (existingAdmin) {
	// 		console.log('Admin user already exists. Skipping creation.');
	// 		return; 
	// 	}

	// 	const adminUser = User.create({
	// 		login: 'admin',
	// 		fullName: 'Admin',
	// 		email: 'admin@example.com',
	// 		password: 'admin',
	// 		isEmailConfirmed: true,
	// 	});

	// 	await User.save(adminUser);
	// 	console.log('Admin user created with id 0');
	// } catch (error) {
	// 	console.error('Error creating admin user:', error.message || error);
	// }
};

export const seedDatabase = async () => {
	// try {
	// 	console.log('Data source has been initialized. Starting to seed...');

	// 	const userCount = await User.count();
	// 	const calendarCount = await Calendar.count();
	// 	const eventCount = await Event.count();

	// 	let users = [];

	// 	if (userCount >= FAKER_USERS) {
	// 		console.log('Users table is not empty. Skipping user creation.');
	// 		users = await User.find();
	// 	} else {
	// 		console.log('Creating users...');
	// 		for (let i = userCount; i < FAKER_USERS; i++) {
	// 			const user = User.create({
	// 				login: faker.internet.username(),
	// 				fullName: faker.person.fullName(),
	// 				email: faker.internet.email(),
	// 				password: faker.internet.password(),
	// 			});
	// 			await user.save();
	// 			users.push(user);
	// 		}
	// 		console.log(`Created ${users.length} users.`);
	// 	}

	// 	let calendars = [];
	// 	if (calendarCount >= FAKER_CALENDARS) {
	// 		console.log('Calendars table is not empty. Skipping calendar creation.');
	// 		calendars = await Calendar.find();
	// 	} else {
	// 		console.log('Creating calendars...');
	// 		for (let i = calendarCount; i < FAKER_CALENDARS; i++) {
	// 			const userID = Math.floor(Math.random() * users.length);
	// 			const calendar = Calendar.create({
	// 				name: `Calendar ${i + 1}`,
	// 				description: faker.lorem.sentence(),
	// 			});
	// 			await calendar.save();
	// 			const ownerPermission = Permission.create({
	// 				user: users[userID],
	// 				calendar: calendar,
	// 				role: "owner"
	// 			});
	// 			await ownerPermission.save();
	// 			calendars.push(calendar);
	// 		}
	// 		console.log(`Created ${calendars.length} calendars.`);
	// 	}

	// 	if (eventCount >= FAKER_EVENTS) {
	// 		console.log('Events table is not empty. Skipping event creation.');
	// 	} else {
	// 		console.log('Creating events...');
	// 		const events = [];
	// 		for (let i = eventCount; i < FAKER_EVENTS; i++) {
	// 			const calendar = calendars[i % calendars.length];
	// 			const startDate = faker.date.future();
	// 			const endDate = faker.date.future({ refDate: startDate });

	// 			const event = Event.create({
	// 				title: faker.lorem.words(3),
	// 				description: faker.lorem.sentence(),
	// 				startDate,
	// 				endDate,
	// 				calendar,
	// 			});
	// 			await event.save();
	// 			events.push(event);
	// 		}
	// 		console.log(`Created ${events.length} events.`);
	// 	}

	// 	console.log('Database has been seeded successfully.');
	// } catch (error) {
	// 	console.error('Error seeding database:', error.message || error);
	// }
};
