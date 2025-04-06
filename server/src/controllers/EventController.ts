// import { Request, Response } from 'express';
// import { Event } from '../models/Event';
// import { Calendar } from '../models/Calendar';
// import { User } from '../models/User';
// import axios from 'axios';
// import fs from 'fs';
// import csv from 'csv-parser';
// import { Permission } from '../models/Permission';
// import { sendInviteEmail } from '../utils/emailService';
// import { sign, verify } from 'jsonwebtoken';
// import { MoreThanOrEqual, LessThanOrEqual, Between } from "typeorm";
// import { getGoogleAccessToken, generateGoogleMeetLink, getZoomAccessToken, generateZoomLink } from '../utils/linkCreation';
// import { In } from 'typeorm';

// const hasEventPermission = async (userId: string, eventId: string, requiredRoles: string[]): Promise<boolean> => {
//     const event = await Event.findOne({ where: { id: eventId }, relations: ['calendar'] });
//     if (!event || !event.calendar) return false;

//     const calendarOwner = await Permission.findOne({ where: { user: { id: userId }, calendar: { id: event.calendar.id }, role: In(requiredRoles) } });
//     if (calendarOwner) return true;

//     const permission = await Permission.findOne({ where: { user: { id: userId }, event: { id: eventId } } });
//     return permission ? requiredRoles.includes(permission.role) : false;
// };


// async function getCalendarId(location: string): Promise<string | null> {
//     return new Promise((resolve, reject) => {
//         const results: Record<string, string>[] = [];

//         fs.createReadStream('cal.csv')
//             .pipe(csv())
//             .on('data', data => results.push(data))
//             .on('end', () => {
//                 const row = results.find(row => row['Religion/Country'] === location);
//                 if (row) {
//                     const calendarId = row['calendarID'];
//                     if (calendarId) {
//                         resolve(calendarId);
//                     } else {
//                         resolve(process.env.CAL_ID || null);
//                     }
//                 } else {
//                     resolve(null);
//                 }
//             })
//             .on('error', err => reject(err));
//     });
// }

// export const EventController = {
//     async getAllEvents(req: Request, res: Response): Promise<Response> {
//         try {
//             const events = await Event.find({ relations: ['calendar'] });
//             return res.status(200).json(events);
//         } catch (error) {
//             console.error(error);
//             return res.status(500).json({ message: 'Error fetching events' });
//         }
//     },

//     async getEventById(req: Request, res: Response): Promise<Response> {
//         const { eventId } = req.params;

//         try {
//             const event = await Event.findOne({
//                 where: { id: eventId },
//                 relations: ['calendar'],
//             });

//             if (!event) {
//                 return res.status(404).json({ message: 'Event not found' });
//             }

//             return res.status(200).json(event);
//         } catch (error) {
//             console.error(error);
//             return res.status(500).json({ message: 'Error fetching event' });
//         }
//     },

//     async createEvent(req: Request, res: Response): Promise<Response> {
//         const { calendarId } = req.params;
//         const { title, description, start, end, color, type, zoom, location } = req.body;
//         let zoomLink = "", locationLink = "";

//         if (zoom) {
//             try {
//                 const res = await generateZoomLink();
//                 zoomLink = res.start_url;
//             } catch (error) {
//                 console.error("Failed to generate Zoom link:", error);
//             }
//         }
//         if (location) {
//             locationLink = location;
//         }

//         try {
//             const calendar = await Calendar.findOne({ where: { id: calendarId } });

//             if (!calendar) {
//                 return res.status(404).json({ message: 'Calendar not found' });
//             }

//             const event = new Event();
//             event.title = title;
//             event.description = zoom && location ? `${zoomLink}\n${locationLink}` : zoom ? zoomLink : location ? locationLink : description;
//             event.startDate = new Date(start);
//             event.endDate = new Date(end);
//             event.color = color;
//             event.calendar = calendar;
//             event.type = type;

//             await event.save();

//             return res.status(201).json({ message: 'Event created successfully', event });
//         } catch (error) {
//             console.error(error);
//             return res.status(500).json({ message: 'Error creating event' });
//         }
//     },
//     async createSequenceEvent(req: Request, res: Response): Promise<Response> {
//         const { calendarId } = req.params;
//         const { title, description, start, end, color, type, repeatNess } = req.body;

//         try {
//             const calendar = await Calendar.findOne({ where: { id: calendarId } });

//             if (!calendar) {
//                 return res.status(404).json({ message: 'Calendar not found' });
//             }

//             const startDate = new Date(start);
//             const endDate = new Date(end);

//             let repeatCount = 1;

//             switch (repeatNess) {
//                 case 'day':
//                     repeatCount = 365;
//                     break;
//                 case 'week':
//                     repeatCount = 104;
//                     break;
//                 case 'month':
//                     repeatCount = 60;
//                     break;
//                 case 'year':
//                     repeatCount = 10;
//                     break;
//                 default:
//                     return res.status(400).json({ message: 'Invalid repeatNess value' });
//             }

//             const events = [];

//             for (let i = 0; i < repeatCount; i++) {
//                 const event = new Event();
//                 event.title = title;
//                 event.description = description;
//                 event.startDate = new Date(startDate);
//                 event.endDate = new Date(endDate);
//                 event.color = color;
//                 event.calendar = calendar;
//                 event.type = type;

//                 events.push(event);

//                 if (repeatNess === 'day') {
//                     startDate.setDate(startDate.getDate() + 1);
//                     endDate.setDate(endDate.getDate() + 1);
//                 } else if (repeatNess === 'week') {
//                     startDate.setDate(startDate.getDate() + 7);
//                     endDate.setDate(endDate.getDate() + 7);
//                 } else if (repeatNess === 'month') {
//                     startDate.setMonth(startDate.getMonth() + 1);
//                     endDate.setMonth(endDate.getMonth() + 1);
//                 } else if (repeatNess === 'year') {
//                     startDate.setFullYear(startDate.getFullYear() + 1);
//                     endDate.setFullYear(endDate.getFullYear() + 1);
//                 }
//             }

//             await Event.save(events);

//             return res.status(201).json({ message: 'Recurring events created successfully', event: events[0] });
//         } catch (error) {
//             console.error(error);
//             return res.status(500).json({ message: 'Error creating events' });
//         }
//     },

//     async updateEvent(req: Request, res: Response): Promise<Response> {
//         const { eventId } = req.params;
//         const { title, description, start, end, color } = req.body;
//         const userId = req.user.id;

//         try {
//             const event = await Event.findOne({ where: { id: eventId } });

//             if (!event) {
//                 return res.status(404).json({ message: 'Event not found' });
//             }

//             if (!(await hasEventPermission(String(userId), eventId, ['editor', 'manager', 'owner']))) {
//                 return res.status(403).json({ message: 'Access denied' });
//             }

//             if (title) event.title = title;
//             if (description) event.description = description;
//             if (start) event.startDate = new Date(start);
//             if (end) event.endDate = new Date(end);
//             if (color) event.color = color;

//             await event.save();

//             return res.status(200).json({ message: 'Event updated successfully', event });
//         } catch (error) {
//             console.error(error);
//             return res.status(500).json({ message: 'Error updating event' });
//         }
//     },

//     async deleteEvent(req: Request, res: Response): Promise<Response> {
//         const { eventId } = req.params;
//         const userId = req.user.id;

//         try {
//             const event = await Event.findOne({ where: { id: eventId } });

//             if (!event) {
//                 return res.status(404).json({ message: 'Event not found' });
//             }

//             if (!(await hasEventPermission(String(userId), eventId, ['manager', 'owner']))) {
//                 return res.status(403).json({ message: 'Access denied' });
//             }

//             await event.remove();

//             return res.status(200).json({ message: 'Event deleted successfully' });
//         } catch (error) {
//             console.error(error);
//             return res.status(500).json({ message: 'Error deleting event' });
//         }
//     },

//     async getEventsByCalendar(req: Request, res: Response): Promise<Response> {
//         const { calendarId } = req.params;
//         const { start, end } = req.query;
//         try {
//             const startDate = start ? new Date(start as string) : undefined;
//             const endDate = end ? new Date(end as string) : undefined;



//             const events = await Event.find({
//                 where: [
//                     {
//                         calendar: { id: calendarId },
//                         startDate: Between(startDate, endDate)
//                     },
//                     {
//                         calendar: { id: calendarId },
//                         endDate: Between(startDate, endDate)
//                     }
//                 ]
//             });
//             return res.status(200).json(events);
//         } catch (error) {
//             console.error(error);
//             return res.status(500).json({ message: 'Error fetching events for calendar' });
//         }
//     },

//     async getEventsByLocation(req: Request, res: Response): Promise<Response> {
//         const { country } = req.body;
//         try {
//             const calendarId = await getCalendarId(country);
//             if (!calendarId) {
//                 return res.status(404).json({ error: `No calendar found for location: ${country}` });
//             }

//             const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${process.env.API_KEY}`;
//             axios
//                 .get(url)
//                 .then(response => {
//                     res.status(200).json(response.data);
//                 })
//                 .catch(error => {
//                     return res.status(500).json({ error: 'Error fetching events', message: error.message });
//                 });
//         } catch (error) {
//             console.error(error);
//             return res.status(500).json({ message: `Error fetching events for ${country.label}` });
//         }
//     },

//     async inviteUserToEvent(req: Request, res: Response): Promise<Response> {
//         const { eventId } = req.params;
//         const { email, role } = req.body;
//         const userId = req.user.id;

//         try {
//             const event = await Event.findOne({ where: { id: eventId }, relations: ['calendar'] });

//             if (!event) {
//                 return res.status(404).json({ message: 'Event not found' });
//             }

//             const permission = await Permission.findOne({
//                 where: {
//                     calendar: event.calendar,
//                     user: { id: String(userId) },
//                     role: In(['owner', 'manager']),
//                 },
//             });

//             if (!permission) {
//                 return res.status(403).json({ message: 'Only the calendar owner can invite users' });
//             }

//             const inviteToken = sign({ email, eventId, role }, process.env.SECRET_KEY!, { expiresIn: '7d' });
//             const inviteUrl = `${process.env.FRONT_URL}/join/${inviteToken}`;

//             await sendInviteEmail(email, inviteUrl, role, 'event');

//             return res.json({ message: 'Invitation sent successfully' });
//         } catch (error) {
//             console.error(error);
//             return res.status(500).json({ message: 'Error sending invitation' });
//         }
//     },


//     async joinEvent(req: Request, res: Response): Promise<Response> {
//         const { inviteToken } = req.params;
//         const userId = req.user.id;

//         try {
//             const decoded: any = verify(inviteToken, process.env.SECRET_KEY!);
//             if (!decoded) {
//                 return res.status(400).json({ message: 'Invalid or expired invite token' });
//             }

//             const { email, eventId, role } = decoded;

//             const user = await User.findOne({ where: { id: String(userId) } });
//             if (!user) {
//                 return res.status(404).json({ message: 'User not found' });
//             }

//             if (user.email !== email) {
//                 return res.status(403).json({ message: 'This invite is not for you' });
//             }

//             const existingPermission = await Permission.findOne({ where: { user, event: { id: eventId } } });
//             if (existingPermission) {
//                 return res.status(400).json({ message: 'User is already in the event' });
//             }

//             const newPermission = Permission.create({ user, event: { id: eventId }, role });
//             await newPermission.save();

//             return res.json({ message: 'Successfully joined the event' });
//         } catch (error) {
//             console.error(error);
//             return res.status(500).json({ message: 'Error joining event' });
//         }
//     },

//     async getEventUsers(req: Request, res: Response) {
//         const { eventId } = req.params;

//         try {
//             const event = await Event.findOne({ where: { id: eventId } });
//             if (!event) {
//                 return res.status(404).json({ message: 'Event not found' });
//             }

//             const permissions = await Permission.find({
//                 where: { event: { id: eventId } },
//                 relations: ['user'],
//             });

//             const users = permissions.map(p => ({
//                 id: p.user.id,
//                 fullName: p.user.fullName,
//                 email: p.user.email,
//                 login: p.user.login,
//                 role: p.role,
//             }));

//             return res.json(users);
//         } catch (error) {
//             console.error('Error fetching event users:', error);
//             return res.status(500).json({ message: 'Internal server error' });
//         }
//     },

//     async removeUserFromEvent(req: Request, res: Response) {
//         const { eventId, userId } = req.params;

//         try {
//             const permission = await Permission.findOne({ where: { event: { id: eventId }, user: { id: userId } } });

//             if (!permission) {
//                 return res.status(404).json({ message: 'User not found in event' });
//             }

//             await Permission.remove(permission);
//             return res.json({ message: 'User removed from event successfully' });
//         } catch (error) {
//             console.error('Error removing user from event:', error);
//             return res.status(500).json({ message: 'Internal server error' });
//         }
//     },
// };
