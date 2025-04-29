import AdminJS from 'adminjs';
import * as AdminJSExpress from '@adminjs/express/src/index'
import * as AdminJSTypeORM from '@adminjs/typeorm/lib/index'
import bcrypt from 'bcrypt';
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

const authenticate = async (email, password) => {
    const user = await User.findOne({
        where: { email, isAdmin: true },
    });

    if (!user) {
        return null;
    }
    const validPassword = bcrypt.compare(password, user.password);
    if (!validPassword) {
        return null;
    }
    return Promise.resolve({ email, password });
};

AdminJS.registerAdapter({
    Resource: AdminJSTypeORM.Resource,
    Database: AdminJSTypeORM.Database,
});

const locale = {
    language: 'en',
    translations: {
        labels: {},
        messages: {
            loginWelcome: 'Welcome to Gayorgiy Eventovich admin page! Please provide admin credentials to continue.',
        },
    },
};


const admin = new AdminJS({
    resources: [
        User, Ticket, Theme, Subscription, Promocode, Payment, Notification, Format, Event, Company, Comment
    ],
    locale,
    branding: {}
})

const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
    admin,
    {
        authenticate,
        cookieName: 'adminjs',
        cookiePassword: 'sessionsecret'
    },
    null,
    {
        resave: true,
        saveUninitialized: true,
    }
)

export default adminRouter;