import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Client } from 'pg';
import { faker } from '@faker-js/faker';
require('dotenv').config();
import path from 'path';
import { User } from '../models/User';
import { Event } from '../models/Event';
import { Comment } from '../models/Comment';
import { Company } from '../models/Company';
import { Promocode } from '../models/Promocode';
import { Notification } from '../models/Notification';
import { Subscription } from '../models/Subscription';
import { Theme } from '../models/Theme';
import { Format } from '../models/Format';
import { Ticket } from '../models/Ticket';
import { Payment } from '../models/Payment';

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
	entities: [path.join(__dirname, '../models/*.{ts,js}')],
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
	const userCount = await User.count();
	const companyCount = await Company.count();
	const eventCount = await Event.count();
	const formatCount = await Format.count();
	const themeCount = await Theme.count();

	if (userCount > 0 || companyCount > 0 || eventCount > 0 || formatCount > 0 || themeCount > 0) {
		console.log('Database already seeded. Skipping...');
		return;
	}

	const users: User[] = [];

	for (let i = 0; i < 25; i++) {
		const user = User.create({
			fullName: faker.person.fullName(),
			email: faker.internet.email(),
			login: faker.internet.username(),
			password: 'password123',
		});
		await user.save();
		users.push(user);
	}

	const admin = User.create({
		fullName: 'Admin User',
		email: 'admin@example.com',
		login: 'admin',
		password: 'admin123',
		isAdmin: true,
		isEmailConfirmed: true,
	});

	await admin.save();
	users.push(admin);

	const companies: Company[] = [];
	for (let i = 0; i < 25; i++) {
		const company = Company.create({
			name: faker.company.name(),
			email: faker.internet.email(),
			location: faker.location.city(),
			owner: users[i],
		});
		await company.save();
		companies.push(company);
	}

	const adminCompany = Company.create({
		name: 'Admin Corporation',
		email: 'admin@company.com',
		location: faker.location.city(),
		owner: admin,
	});

	await adminCompany.save();
	companies.push(adminCompany);

	const formats: Format[] = [];
	for (let i = 0; i < 5; i++) {
		const format = Format.create({ title: faker.word.noun() });
		await format.save();
		formats.push(format);
	}

	const themes: Theme[] = [];
	for (let i = 0; i < 5; i++) {
		const theme = Theme.create({ title: faker.word.adjective() });
		await theme.save();
		themes.push(theme);
	}

	const event1 = Event.create({
		title: 'The International 2025',
		description: "That's right. The stars have aligned and the stage is once again being set for cosmic battle. And this time, that battle has returned to where it all began: Germany, the site of The International's humble debut on the world stage, where it was watched in person by many tens of people. Now, fourteen years later, The International returns to Germany, to Hamburg's Barclays Arena September 11 - 14 — in front of, we trust, a slightly bigger crowd this time around.",
		price: 199,
		location: faker.location.streetAddress(),
		date: faker.date.future(),
		publishDate: null,
		ticket_limit: faker.number.int({ min: 50, max: 500 }),
		is_published: true,
		poster: 'http://localhost:8000/avatars/image.png',
		company: adminCompany,
		formats: faker.helpers.arrayElements(formats, 2),
		themes: faker.helpers.arrayElements(themes, 2),
		allAttendeesVisible: true,
	})
	await event1.save();

	const event2 = Event.create({
		title: 'Porsche Exhibition',
		description: "Yeah some dudes bring their porsches and we are going to look at them. Have fun...",
		price: 199,
		location: faker.location.streetAddress(),
		date: faker.date.future(),
		publishDate: null,
		ticket_limit: faker.number.int({ min: 50, max: 500 }),
		is_published: true,
		poster: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8cG9yc2NoZSUyMHdhbGxwYXBlcnxlbnwwfHwwfHx8MA%3D%3D',
		company: adminCompany,
		formats: faker.helpers.arrayElements(formats, 2),
		themes: faker.helpers.arrayElements(themes, 2),
		allAttendeesVisible: true,
	})
	await event2.save();

	const event3 = Event.create({
		title: 'Chemistry Lecture',
		description: "Jesse we need to cook. Let dive deeply in the world of chemistry and learn a couple of nice things...",
		price: 499,
		location: faker.location.streetAddress(),
		date: faker.date.future(),
		publishDate: null,
		ticket_limit: faker.number.int({ min: 50, max: 500 }),
		is_published: true,
		poster: 'https://i.pinimg.com/1200x/0c/6e/a5/0c6ea5eab1c1fe08bc820f03763782a7.jpg',
		company: adminCompany,
		formats: faker.helpers.arrayElements(formats, 2),
		themes: faker.helpers.arrayElements(themes, 2),
		allAttendeesVisible: true,
	})
	await event3.save();

	const event4 = Event.create({
		title: 'Psycho Evening',
		description: "Spend time watching the one of the best movies in the world.",
		price: 99,
		location: faker.location.streetAddress(),
		date: faker.date.future(),
		publishDate: null,
		ticket_limit: faker.number.int({ min: 50, max: 500 }),
		is_published: true,
		poster: 'https://i.pinimg.com/1200x/0e/10/35/0e1035e4818ce2f47d09bea3bf95af41.jpg',
		company: adminCompany,
		formats: faker.helpers.arrayElements(formats, 2),
		themes: faker.helpers.arrayElements(themes, 2),
		allAttendeesVisible: true,
	})
	await event4.save();

	const event5 = Event.create({
		title: 'Fast & Furious Street Racing',
		description: "Experience the thrill of underground racing in this high-octane event where speed, style, and skill collide. Compete against top drivers in intense street circuits, show off your customized ride, and feel the adrenaline of pure street power. Only the fastest survive!",
		price: 999,
		location: faker.location.streetAddress(),
		date: faker.date.future(),
		publishDate: null,
		ticket_limit: faker.number.int({ min: 50, max: 500 }),
		is_published: true,
		poster: 'https://wallpapersok.com/images/hd/digital-illustration-of-fast-and-furious-dubzjas3amqndn86.jpg',
		company: adminCompany,
		formats: faker.helpers.arrayElements(formats, 2),
		themes: faker.helpers.arrayElements(themes, 2),
		allAttendeesVisible: true,
	})
	await event5.save();

	for (let i = 0; i < 400; i++) {
		const shouldHavePublishDate = faker.datatype.boolean();
		const publishDate = shouldHavePublishDate ? faker.date.future({ years: 1 }) : null;

		let eventDate;
		if (publishDate) {
			// Pick random number of days (1-180) after publishDate
			const daysAfter = faker.number.int({ min: 1, max: 180 });
			eventDate = new Date(publishDate);
			eventDate.setDate(eventDate.getDate() + daysAfter);
		} else {
			// Just random future date if no publishDate
			eventDate = faker.date.future();
		}

		const event = Event.create({
			title: faker.lorem.words(3),
			description: faker.lorem.paragraph(),
			price: parseFloat(faker.commerce.price({ min: 5, max: 100 })),
			location: faker.location.streetAddress(),
			date: eventDate,
			publishDate: publishDate,
			ticket_limit: faker.number.int({ min: 50, max: 500 }),
			is_published: faker.datatype.boolean(),
			poster: faker.image.urlPicsumPhotos({width: 1920, height: 1080}),
			company: faker.helpers.arrayElement(companies),
			formats: faker.helpers.arrayElements(formats, 2),
			themes: faker.helpers.arrayElements(themes, 2),
			allAttendeesVisible: faker.datatype.boolean(),
		});
		await event.save();
	}

	const allEvents = await Event.find();
	const allUsers = await User.find();

	for (const event of allEvents) {
		const ticketCount = faker.number.int({ min: 10, max: Math.min(50, event.ticket_limit || 100) });

		const ticketHolders = faker.helpers.arrayElements(allUsers, ticketCount);

		for (const user of ticketHolders) {
			const ticket = Ticket.create({
				event,
				user,
				qr_code:
					'data:image/png;base64,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',
			});
			await ticket.save();
		}
	}


	console.log('Database seeded successfully');
};
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

//};
