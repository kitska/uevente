import { Request, Response } from 'express';
import { Event } from '../models/Event';
import { Calendar } from '../models/Calendar';
import { User } from '../models/User';
import axios from 'axios';
import fs from 'fs';
import csv from 'csv-parser';
import { Permission } from '../models/Permission';
import { sendInviteEmail } from '../utils/emailService';
import { sign, verify } from 'jsonwebtoken';
import { MoreThanOrEqual, LessThanOrEqual, Between } from "typeorm";
import { getGoogleAccessToken, generateGoogleMeetLink, getZoomAccessToken, generateZoomLink } from '../utils/linkCreation';
import { In } from 'typeorm';

const hasEventPermission = async (userId: string, eventId: string, requiredRoles: string[]): Promise<boolean> => {
    // Находим событие и его календарь
    const event = await Event.findOne({ where: { id: eventId }, relations: ['calendar'] });
    if (!event || !event.calendar) return false;

    // Проверяем, есть ли у пользователя права "owner" на календарь
    const calendarOwner = await Permission.findOne({ where: { user: { id: userId }, calendar: { id: event.calendar.id }, role: In(requiredRoles) } });
    if (calendarOwner) return true;

    // Проверяем права пользователя в `Permission` для конкретного события
    const permission = await Permission.findOne({ where: { user: { id: userId }, event: { id: eventId } } });
    return permission ? requiredRoles.includes(permission.role) : false;
};


async function getCalendarId(location: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
        const results: Record<string, string>[] = [];

        fs.createReadStream('cal.csv')
            .pipe(csv())
            .on('data', data => results.push(data))
            .on('end', () => {
                // Find the row where the country label matches the location
                const row = results.find(row => row['Religion/Country'] === location);
                if (row) {
                    const calendarId = row['calendarID'];
                    if (calendarId) {
                        resolve(calendarId); // Возвращаем найденный ID
                    } else {
                        resolve(process.env.CAL_ID || null); // Если ID пустой, вернуть значение из переменных окружения
                    }
                } else {
                    resolve(null); // No match found
                }
            })
            .on('error', err => reject(err));
    });
}

export const EventController = {
    async getAllEvents(req: Request, res: Response): Promise<Response> {
        try {
            const events = await Event.find({ relations: ['calendar'] });
            return res.status(200).json(events);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error fetching events' });
        }
    },

    async getEventById(req: Request, res: Response): Promise<Response> {
        const { eventId } = req.params;

        try {
            const event = await Event.findOne({
                where: { id: eventId },
                relations: ['calendar'],
            });

            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }

            return res.status(200).json(event);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error fetching event' });
        }
    },

    async createEvent(req: Request, res: Response): Promise<Response> {
        const { calendarId } = req.params;
        const { title, description, start, end, color, type, zoom, location } = req.body;
        // new lin
        let zoomLink = "", locationLink = "";
        // console.log(zoom, meet, location);
        // if (meet) {
        //     try {
        //         const res = await generateGoogleMeetLink();
        //         // zoomLink = res.start_url;
        //         console.log(res);
        //     } catch (error) {
        //         console.error("Failed to generate Meet link:", error);
        //     }
        //     // console.log(await generateGoogleMeetLink("testMeet", "2025-03-22T10:00:00Z", "2025-03-22T11:00:00Z"));

        // }
        if (zoom) {
            try {
                const res = await generateZoomLink();
                zoomLink = res.start_url;
            } catch (error) {
                console.error("Failed to generate Zoom link:", error);
            }
        }
        if (location) {
            locationLink = location;
        }

        try {
            const calendar = await Calendar.findOne({ where: { id: calendarId } });

            if (!calendar) {
                return res.status(404).json({ message: 'Calendar not found' });
            }

            const event = new Event();
            event.title = title;
            event.description = zoom && location ? `${zoomLink}\n${locationLink}` : zoom ? zoomLink : location ? locationLink : description;
            event.startDate = new Date(start);
            event.endDate = new Date(end);
            event.color = color;
            event.calendar = calendar;
            event.type = type;

            await event.save();

            return res.status(201).json({ message: 'Event created successfully', event });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error creating event' });
        }
    },
    async createSequenceEvent(req: Request, res: Response): Promise<Response> {
        const { calendarId } = req.params;
        const { title, description, start, end, color, type, repeatNess } = req.body;

        try {
            const calendar = await Calendar.findOne({ where: { id: calendarId } });

            if (!calendar) {
                return res.status(404).json({ message: 'Calendar not found' });
            }

            const startDate = new Date(start);
            const endDate = new Date(end);

            let repeatCount = 1;

            switch (repeatNess) {
                case 'day':
                    repeatCount = 365;
                    break;
                case 'week':
                    repeatCount = 104;
                    break;
                case 'month':
                    repeatCount = 60;
                    break;
                case 'year':
                    repeatCount = 10;
                    break;
                default:
                    return res.status(400).json({ message: 'Invalid repeatNess value' });
            }

            const events = [];

            for (let i = 0; i < repeatCount; i++) {
                const event = new Event();
                event.title = title;
                event.description = description;
                event.startDate = new Date(startDate);
                event.endDate = new Date(endDate);
                event.color = color;
                event.calendar = calendar;
                event.type = type;

                events.push(event);

                // Adjust the start and end dates based on repeatNess
                if (repeatNess === 'day') {
                    startDate.setDate(startDate.getDate() + 1);
                    endDate.setDate(endDate.getDate() + 1);
                } else if (repeatNess === 'week') {
                    startDate.setDate(startDate.getDate() + 7);
                    endDate.setDate(endDate.getDate() + 7);
                } else if (repeatNess === 'month') {
                    startDate.setMonth(startDate.getMonth() + 1);
                    endDate.setMonth(endDate.getMonth() + 1);
                } else if (repeatNess === 'year') {
                    startDate.setFullYear(startDate.getFullYear() + 1);
                    endDate.setFullYear(endDate.getFullYear() + 1);
                }
            }

            await Event.save(events);

            return res.status(201).json({ message: 'Recurring events created successfully', event: events[0] });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error creating events' });
        }
    },

    async updateEvent(req: Request, res: Response): Promise<Response> {
        const { eventId } = req.params;
        const { title, description, start, end, color } = req.body;
        const userId = req.user.id;

        try {
            const event = await Event.findOne({ where: { id: eventId } });

            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }

            // Проверяем права доступа
            if (!(await hasEventPermission(String(userId), eventId, ['editor', 'manager', 'owner']))) {
                return res.status(403).json({ message: 'Access denied' });
            }

            if (title) event.title = title;
            if (description) event.description = description;
            if (start) event.startDate = new Date(start);
            if (end) event.endDate = new Date(end);
            if (color) event.color = color;

            await event.save();

            return res.status(200).json({ message: 'Event updated successfully', event });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error updating event' });
        }
    },

    async deleteEvent(req: Request, res: Response): Promise<Response> {
        const { eventId } = req.params;
        const userId = req.user.id;

        try {
            const event = await Event.findOne({ where: { id: eventId } });

            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }

            // Проверяем права доступа
            if (!(await hasEventPermission(String(userId), eventId, ['manager', 'owner']))) {
                return res.status(403).json({ message: 'Access denied' });
            }

            await event.remove();

            return res.status(200).json({ message: 'Event deleted successfully' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error deleting event' });
        }
    },

    async getEventsByCalendar(req: Request, res: Response): Promise<Response> {
        const { calendarId } = req.params;
        const { start, end } = req.query;
        try {
            const startDate = start ? new Date(start as string) : undefined;
            const endDate = end ? new Date(end as string) : undefined;
            // const newDate = new Date(date as string).toLocaleString('en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
            // let startDate = newDate ? newDate : undefined;
            // let endDate = newDate ? newDate : undefined;

            // Manually adjust the hours to ensure no time shift happens
            // if (startDate) {
            //     startDate.setHours(0, 0, 0, 0);  // Set to 00:00:00:000
            // }
            // if (endDate) {
            //     endDate.setHours(23, 59, 59, 999);  // Set to 23:59:59:999
            // }

            // console.log(date);
            // console.log(startDate, endDate);

            const events = await Event.find({
                where: [
                    {
                        calendar: { id: calendarId },
                        startDate: Between(startDate, endDate)
                    },
                    {
                        calendar: { id: calendarId },
                        endDate: Between(startDate, endDate)
                    }
                ]
            });
            return res.status(200).json(events);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error fetching events for calendar' });
        }
    }, //tozhe samoe est v calendar controllere -_-  ->  .|.

    async getEventsByLocation(req: Request, res: Response): Promise<Response> {
        const { country } = req.body;
        try {
            // Get the calendar ID for the location
            const calendarId = await getCalendarId(country);
            if (!calendarId) {
                return res.status(404).json({ error: `No calendar found for location: ${country}` });
            }
            // console.log(calendarId)

            // Make the request to Google Calendar API
            const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${process.env.API_KEY}`;
            // console.log(url);
            axios
                .get(url)
                .then(response => {
                    res.status(200).json(response.data);
                })
                .catch(error => {
                    return res.status(500).json({ error: 'Error fetching events', message: error.message });
                });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: `Error fetching events for ${country.label}` });
        }
    },

    async inviteUserToEvent(req: Request, res: Response): Promise<Response> {
        const { eventId } = req.params;
        const { email, role } = req.body; // Email приглашенного + его права
        const userId = req.user.id;

        try {
            const event = await Event.findOne({ where: { id: eventId }, relations: ['calendar'] });

            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }

            // Проверяем, что приглашает владелец календаря
            const permission = await Permission.findOne({
                where: {
                    calendar: event.calendar,
                    user: { id: String(userId) },
                    role: In(['owner', 'manager']),
                },
            });

            if (!permission) {
                return res.status(403).json({ message: 'Only the calendar owner can invite users' });
            }

            // Генерируем JWT-токен с информацией о приглашении
            const inviteToken = sign({ email, eventId, role }, process.env.SECRET_KEY!, { expiresIn: '7d' });
            const inviteUrl = `${process.env.FRONT_URL}/join/${inviteToken}`;

            await sendInviteEmail(email, inviteUrl, role, 'event');

            return res.json({ message: 'Invitation sent successfully' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error sending invitation' });
        }
    },


    async joinEvent(req: Request, res: Response): Promise<Response> {
        const { inviteToken } = req.params;
        const userId = req.user.id; // Авторизованный пользователь

        try {
            // Расшифровываем токен
            const decoded: any = verify(inviteToken, process.env.SECRET_KEY!);
            if (!decoded) {
                return res.status(400).json({ message: 'Invalid or expired invite token' });
            }

            const { email, eventId, role } = decoded;

            // Ищем пользователя по ID
            const user = await User.findOne({ where: { id: String(userId) } });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Проверяем, что email совпадает
            if (user.email !== email) {
                return res.status(403).json({ message: 'This invite is not for you' });
            }

            // Проверяем, что пользователь еще не добавлен в событие
            const existingPermission = await Permission.findOne({ where: { user, event: { id: eventId } } });
            if (existingPermission) {
                return res.status(400).json({ message: 'User is already in the event' });
            }

            // Добавляем пользователя с указанной ролью
            const newPermission = Permission.create({ user, event: { id: eventId }, role });
            await newPermission.save();

            return res.json({ message: 'Successfully joined the event' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error joining event' });
        }
    },

    async getEventUsers(req: Request, res: Response) {
        const { eventId } = req.params;

        try {
            const event = await Event.findOne({ where: { id: eventId } });
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }

            const permissions = await Permission.find({
                where: { event: { id: eventId } },
                relations: ['user'],
            });

            const users = permissions.map(p => ({
                id: p.user.id,
                fullName: p.user.fullName,
                email: p.user.email,
                login: p.user.login,
                role: p.role, // Attach the role directly to the user object
            }));

            return res.json(users);
        } catch (error) {
            console.error('Error fetching event users:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    },

    async removeUserFromEvent(req: Request, res: Response) {
        const { eventId, userId } = req.params;

        try {
            const permission = await Permission.findOne({ where: { event: { id: eventId }, user: { id: userId } } });

            if (!permission) {
                return res.status(404).json({ message: 'User not found in event' });
            }

            await Permission.remove(permission);
            return res.json({ message: 'User removed from event successfully' });
        } catch (error) {
            console.error('Error removing user from event:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    },
};
