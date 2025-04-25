import { Request, Response } from 'express';
import { In } from 'typeorm';
import { Event } from '../models/Event';
import { Company } from '../models/Company';
import { Format } from '../models/Format';
import { Theme } from '../models/Theme';
import { Subscription } from '../models/Subscription';
import axios from 'axios';
import { User } from '../models/User';
import { sendEmail } from '../utils/emailService';

export const EventController = {
	async uploadToImgur(imageData: string, type: 'base64' | 'url'): Promise<string | null> {
		try {
			const response = await axios.post(
				'https://api.imgur.com/3/image',
				{
					image: imageData,
					type: type,
				},
				{
					headers: {
						Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
					},
				}
			);

			return response.data.data.link;
		} catch (error) {
			console.error('Imgur upload error:', error.response?.data || error);
			return null;
		}
	},

	async uploadPoster(req: Request, res: Response): Promise<Response> {
		try {
			if (!req.file) {
				return res.status(400).json({ message: 'No file provided' });
			}
	
			// Convert file to base64
			const fileBase64 = req.file.buffer.toString('base64');
	
			// Upload to Imgur
			const uploadedPosterUrl = await this.uploadToImgur(fileBase64, 'base64');
	
			res.json({ url: uploadedPosterUrl });
		} catch (error) {
			console.error('Error uploading poster:', error);
			res.status(500).json({ message: 'Failed to upload poster' });
		}
	},	

	async createEvent(req: Request, res: Response): Promise<Response> {
		const {
			title,
			description,
			price,
			location,
			date,
			ticket_limit,
			is_published,
			poster, // string (URL or base64)
			companyId,
			formatIds,
			themeIds,
		} = req.body;

		try {
			const company = await Company.findOne({ where: { id: companyId } });
			if (!company) return res.status(404).json({ message: 'Company not found' });

			const formats = formatIds?.length ? await Format.findBy({ id: In(formatIds) }) : [];
			const themes = themeIds?.length ? await Theme.findBy({ id: In(themeIds) }) : [];

			let uploadedPosterUrl: string | null = null;

			if (poster?.startsWith('http')) {
				// URL — просто используем
				uploadedPosterUrl = poster;
			} else if (poster?.startsWith('data:image')) {
				// Base64 — вырезаем данные и заливаем
				const base64Data = poster.split(',')[1];
				uploadedPosterUrl = await this.uploadToImgur(base64Data, 'base64');
			} else if (req.file) {
				// Файл — конвертируем в base64 и заливаем
				const fileBase64 = req.file.buffer.toString('base64');
				uploadedPosterUrl = await this.uploadToImgur(fileBase64, 'base64');
			}
			

			const event = Event.create({
				title,
				description,
				price,
				location,
				date,
				ticket_limit,
				is_published,
				poster: uploadedPosterUrl,
				company,
				formats,
				themes,
			});

			await event.save();
			return res.status(201).json({ message: 'Event created successfully', event });
		} catch (error) {
			console.error('Error creating event:', error);
			return res.status(500).json({ message: 'Internal server error' });
		}
	},

	async getAllEvents(req: Request, res: Response): Promise<Response> {
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 10;
		const sort = (req.query.sort as string) || 'date';
		const order = (req.query.order as string) === 'DESC' ? 'DESC' : 'ASC';

		try {
			const [events, total] = await Event.findAndCount({
				relations: ['company', 'formats', 'themes'],
				order: { [sort]: order },
				skip: (page - 1) * limit,
				take: limit,
			});

			return res.status(200).json({
				data: events,
				meta: {
					total,
					page,
					limit,
					totalPages: Math.ceil(total / limit),
				},
			});
		} catch (error) {
			console.error('Error fetching events:', error);
			return res.status(500).json({ message: 'Internal server error' });
		}
	},

	async getEventById(req: Request, res: Response): Promise<Response> {
		const { id } = req.params;

		try {
			const event = await Event.findOne({
				where: { id },
				relations: ['company', 'formats', 'themes'],
			});

			if (!event) {
				return res.status(404).json({ message: 'Event not found' });
			}

			return res.status(200).json(event);
		} catch (error) {
			console.error('Error fetching event:', error);
			return res.status(500).json({ message: 'Internal server error' });
		}
	},

	async updateEvent(req: Request, res: Response): Promise<Response> {
		const { id } = req.params;
		const { title, description, price, location, date, ticket_limit, is_published, poster, companyId, formatIds, themeIds } = req.body;

		try {
			const event = await Event.findOne({
				where: { id },
				relations: ['company', 'formats', 'themes'],
			});

			if (!event) {
				return res.status(404).json({ message: 'Event not found' });
			}
			const changedFields: { field: string; oldValue: any; newValue: any }[] = [];
			if (title !== undefined && title !== event.title) {
				changedFields.push({ field: 'Title', oldValue: event.title, newValue: title });
				event.title = title;
			}
			if (description !== undefined && description !== event.description) {
				changedFields.push({ field: 'Description', oldValue: event.description, newValue: description });
				event.description = description;
			}
			if (price !== undefined && price !== event.price) {
				changedFields.push({ field: 'Price', oldValue: event.price, newValue: price });
				event.price = price;
			}
			if (location !== undefined && location !== event.location) {
				changedFields.push({ field: 'Location', oldValue: event.location, newValue: location });
				event.location = location;
			}
			if (date !== undefined && new Date(date).getTime() !== event.date.getTime()) {
				changedFields.push({ field: 'Date', oldValue: event.date.toISOString(), newValue: new Date(date).toISOString() });
				event.date = new Date(date);
			}
			if (ticket_limit !== undefined && ticket_limit !== event.ticket_limit) {
				changedFields.push({ field: 'Ticket Limit', oldValue: event.ticket_limit, newValue: ticket_limit });
				event.ticket_limit = ticket_limit;
			}
			if (is_published !== undefined && is_published !== event.is_published) {
				changedFields.push({ field: 'Publication Status', oldValue: event.is_published, newValue: is_published });
				event.is_published = is_published;
			}
			if (poster !== undefined && poster !== event.poster) {
				changedFields.push({ field: 'Poster', oldValue: event.poster, newValue: poster });
				event.poster = poster;
			}
			if (companyId !== undefined && companyId !== event.company?.id) {
				const company = await Company.findOne({ where: { id: companyId } });
				if (!company) {
					return res.status(404).json({ message: 'Company not found' });
				}
				changedFields.push({ field: 'Company', oldValue: event.company?.name || 'None', newValue: company.name });
				event.company = company;
			}
			if (Array.isArray(formatIds)) {
				const newFormats = await Format.findBy({ id: In(formatIds) });
				event.formats = newFormats;
				changedFields.push({ field: 'Formats', oldValue: (event.formats || []).map(f => f.title).join(', '), newValue: newFormats.map(f => f.title).join(', ') });
			}
			if (Array.isArray(themeIds)) {
				const newThemes = await Theme.findBy({ id: In(themeIds) });
				event.themes = newThemes;
				changedFields.push({ field: 'Themes', oldValue: (event.themes || []).map(t => t.title).join(', '), newValue: newThemes.map(t => t.title).join(', ') });
			}
			await event.save();

			const subject = `Event "${event.title}" has been updated`;
			const emailContent = `
			<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #333;">
			  <tr>
				<td style="padding: 40px; font-family: Arial, sans-serif; color: #ffffff;">
				  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: rgba(0,0,0,0.5); padding: 30px; border-radius: 10px;">
					<tr>
					  <td>
						<h1 style="font-size: 32px; margin-bottom: 10px;">Event Update Notification</h1>
						<p style="font-size: 18px; margin-bottom: 20px;">The following updates have been made to the event <strong>${event.title}</strong>:</p>
						<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 30px;">
						  <thead>
							<tr>
							  <th align="left" style="padding: 10px; border-bottom: 2px solid #fff;">Field</th>
							  <th align="left" style="padding: 10px; border-bottom: 2px solid #fff;">Old Value</th>
							  <th align="left" style="padding: 10px; border-bottom: 2px solid #fff;">New Value</th>
							</tr>
						  </thead>
						  <tbody>
							${changedFields.map(field => `
							  <tr>
								<td style="padding: 10px; border-bottom: 1px solid #ccc;">${field.field}</td>
								<td style="padding: 10px; border-bottom: 1px solid #ccc;">${field.oldValue ?? '—'}</td>
								<td style="padding: 10px; border-bottom: 1px solid #ccc;">${field.newValue ?? '—'}</td>
							  </tr>
							`).join('')}
						  </tbody>
						</table>
						<p style="font-size: 16px;">
						  Feel free to check the 
						  <a href="https://localhost:3000/events/${event.id}" style="color: #ffd700;">event page</a> 
						  for full details and updates!
						</p>
						<p style="margin-top: 40px; font-size: 14px; color: #ccc;">
						  You're receiving this email because you're subscribed to this event. Stay tuned for more updates!
						</p>
					  </td>
					</tr>
				  </table>
				</td>
			  </tr>
			</table>
		  `;
			const subs = await Subscription.find({ where: { event: { id: event.id } }, relations: ['user'] });

			for (const sub of subs) {
				sendEmail(sub.user.email, emailContent, subject);
			}

			return res.status(200).json({ message: 'Event updated successfully', event });
		} catch (error) {
			console.error('Error updating event:', error);
			return res.status(500).json({ message: 'Internal server error' });
		}
	},

	async deleteEvent(req: Request, res: Response): Promise<Response> {
		const { id } = req.params;

		try {
			const event = await Event.findOne({ where: { id } });

			if (!event) {
				return res.status(404).json({ message: 'Event not found' });
			}
			const subs = await Subscription.find({ where: { event: { id: event.id } }, relations: ['user'] });

			await event.remove();

			const subject = `Event "${event.title}" has been deleted`;

			const emailContent = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #333;">
  <tr>
    <td style="padding: 40px; font-family: Arial, sans-serif; color: #ffffff;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: rgba(0,0,0,0.5); padding: 30px; border-radius: 10px;">
        <tr>
          <td>
            <h1 style="font-size: 32px; margin-bottom: 10px;">Event Deletion Notice</h1>
            <p style="font-size: 18px; margin-bottom: 20px;">
              We're reaching out to inform you that the event <strong>${event.title}</strong> has been <span style="color: #ff4d4f;">deleted</span>.
            </p>
            <p style="font-size: 16px;">
              This means the event is no longer available and will not take place as originally scheduled. We apologize for any inconvenience.
            </p>
            <p style="margin-top: 40px; font-size: 14px; color: #ccc;">
              You're receiving this email because you were subscribed to this event.
            </p>
			<p style="font-size: 14px; color: #ccc; opacity: 0.8;">
              Due to event cancelation, your subscription is also canceled.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`;
			// (use the `emailContent` string from above)

			for (const sub of subs) {
				sendEmail(sub.user.email, emailContent, subject);
			}



			return res.status(200).json({ message: 'Event deleted successfully' });
		} catch (error) {
			console.error('Error deleting event:', error);
			return res.status(500).json({ message: 'Internal server error' });
		}
	},

	async getEventSubscriptionCount(req: Request, res: Response): Promise<Response> {
		const { eventId } = req.params;

		try {
			const count = await Subscription.count({ where: { event: { id: eventId } } });
			return res.status(200).json({ eventId, count });
		} catch (error) {
			console.error('Error getting subscription count:', error);
			return res.status(500).json({ message: 'Failed to fetch subscription count' });
		}
	},
};

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
