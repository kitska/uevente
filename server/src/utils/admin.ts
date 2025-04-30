import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import * as AdminJSTypeORM from '@adminjs/typeorm';
import bcrypt from 'bcrypt';

// TypeORM entities
import { User } from '../models/User';
import { Ticket } from '../models/Ticket';
import { Theme } from '../models/Theme';
import { Subscription } from '../models/Subscription';
import { Promocode } from '../models/Promocode';
import { Payment } from '../models/Payment';
import { Notification } from '../models/Notification';
import { Format } from '../models/Format';
import { Event } from '../models/Event';
import { Company } from '../models/Company';
import { Comment } from '../models/Comment'; // Make sure this exists
import { AppDataSource, createAdmin, seedDatabase } from '../database/data-source';


// Authentication logic
const authenticate = async (email: string, password: string) => {
    const user = await User.findOne({
        where: { email, isAdmin: true },
    });

    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

    return user;
};

// Register TypeORM adapter
AdminJS.registerAdapter({
    Resource: AdminJSTypeORM.Resource,
    Database: AdminJSTypeORM.Database,
});

export const createAdminRouter = async () => {
    const admin = new AdminJS({
        resources: [
            User, Event, Comment, Company, Promocode,
            Notification, Subscription, Theme, Format, Ticket, Payment,
        ].map(entity => ({ resource: entity })),
        rootPath: '/admin',
        branding: {
            companyName: 'Gayorgiy Eventovich',
        },
        locale: {
            language: 'en',
            translations: {
                messages: {
                    loginWelcome: 'Welcome to Gayorgiy Eventovich admin page! Please provide admin credentials to continue.',
                },
            },
        },
        databases: [], // вручную указываем ресурсы
    });

    const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
        admin,
        {
            authenticate,
            cookieName: 'adminjs',
            cookiePassword: 'sessionsecret',
        },
        null,
        {
            resave: true,
            saveUninitialized: true,
        }
    );

    return adminRouter;
};
