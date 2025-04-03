import { Request, Response } from 'express';
import { Calendar } from '../models/Calendar';
import { User } from '../models/User';
import { Event } from '../models/Event';
import { Permission } from '../models/Permission';
import { sendInviteEmail } from '../utils/emailService';
import { sign, verify } from 'jsonwebtoken';
import { MoreThanOrEqual, LessThanOrEqual } from "typeorm";
// import { Permission } from '../models/Permission_huy';
import { In } from 'typeorm';
//import { Permission } from '../models/Permission_huy';

const hasCalendarPermission = async (userId: String, calendarId: String, requiredRoles: string[]): Promise<boolean> => {
	const permission = await Permission.findOne({ where: { user: { id: String(userId) }, calendar: { id: String(calendarId) } } });
	return permission ? requiredRoles.includes(permission.role) : false;
};

export const CalendarController = {
	async getAllCalendars(req: Request, res: Response): Promise<Response> {
		try {
			const calendars = await Calendar.find({ relations: ['events'] });
			return res.status(200).json(calendars);
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: 'Error fetching calendars' });
		}
	},

	async getOwnerByCalendarId(req: Request, res: Response): Promise<Response> {
		const { calendarId } = req.params;

		try {
			const userPermission = await Permission.findOne({
				where: {
					calendar: { id: calendarId },
					role: 'owner',
				},
				relations: ['user'], // Make sure to load the 'user' relation
			});

			if (!userPermission) {
				return res.status(404).json({ message: 'User not found' });
			}

			return res.status(200).json({ owner: userPermission.user });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: 'Error fetching owner' });
		}
	},

	async getCalendarById(req: Request, res: Response): Promise<Response> {
		const { calendarId } = req.params;

		try {
			const calendar = await Calendar.findOne({
				where: { id: calendarId },
				relations: ['events'],
			});

			if (!calendar) {
				return res.status(404).json({ message: 'Calendar not found' });
			}

			return res.status(200).json(calendar);
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: 'Error fetching calendar' });
		}
	},

	async createCalendar(req: Request, res: Response): Promise<Response> {
		const { name, description, color, ownerId } = req.body;

		try {
			const owner = await User.findOne({ where: { id: ownerId } });
			if (!owner) {
				return res.status(404).json({ message: 'Owner not found' });
			}

			const newCalendar = Calendar.create({
				name,
				description,
				color
			});

			await newCalendar.save();

			// const perrimssion = Permission.find({
			// 	where: {role: "owner"}
			// })

			const ownerPermission = Permission.create({
				user: owner,
				calendar: newCalendar,
				role: 'owner',
			});

			// Save the owner permission
			await ownerPermission.save();
			// await owner.calendars.push(newCalendar);

			return res.status(201).json(newCalendar);
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: 'Error creating calendar' });
		}
	},

	async updateCalendar(req: Request, res: Response): Promise<Response> {
		const { calendarId } = req.params;
		const { name, description, color } = req.body;
		const userId = req.user.id;

		try {
			const calendar = await Calendar.findOne({ where: { id: calendarId } });

			if (!calendar) {
				return res.status(404).json({ message: 'Calendar not found' });
			}

			// Проверяем права доступа
			if (!(await hasCalendarPermission(String(userId), calendarId, ['editor', 'manager', 'owner']))) {
				return res.status(403).json({ message: 'Access denied' });
			}

			if (name) calendar.name = name;
			if (description) calendar.description = description;
			// if (isActive != null) calendar.isActive = isActive;
			if (color != null) calendar.color = color;

			await calendar.save();

			return res.status(200).json(calendar);
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: 'Error updating calendar' });
		}
	},

	async deleteCalendar(req: Request, res: Response): Promise<Response> {
		const { calendarId } = req.params;
		console.log(req.user);
		const userId = req.user.id;

		try {
			const calendar = await Calendar.findOne({ where: { id: calendarId } });

			if (!calendar) {
				return res.status(404).json({ message: 'Calendar not found' });
			}

			// Проверяем права доступа
			if (!(await hasCalendarPermission(String(userId), calendarId, ['manager', 'owner']))) {
				return res.status(403).json({ message: 'Access denied' });
			}

			await calendar.remove();

			return res.status(200).json({ message: 'Calendar successfully deleted' });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: 'Error deleting calendar' });
		}
	},

	async getUsersInCalendar(req: Request, res: Response): Promise<Response> {
		const { calendarId } = req.params;

		try {
			const calendar = await Calendar.findOne({
				where: { id: calendarId },
			});

			if (!calendar) {
				return res.status(404).json({ message: 'Calendar not found' });
			}

			const permissions = await Permission.find({
				where: {
					calendar: calendar,
				},
				relations: ['user'],
			});
			const users = permissions.map(permission => ({
				id: permission.user.id,
				fullName: permission.user.fullName,
				email: permission.user.email,
				login: permission.user.login,
				role: permission.role, // Attach the role directly to the user object
			}));

			return res.status(200).json(users);
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: 'Error fetching users in calendar' });
		}
	},

	async addUserToCalendar(req: Request, res: Response): Promise<Response> {
		const { calendarId } = req.params;
		const { email, login } = req.body;

		if (!email) {
			return res.status(400).json({ message: 'Email or login is required' });
		}

		try {
			const calendar = await Calendar.findOne({
				where: { id: calendarId },
			});

			if (!calendar) {
				return res.status(404).json({ message: 'Calendar not found' });
			}

			const user = await User.findOne({
				where: email ? { email } : { login },
			});

			if (!user) {
				return res.status(404).json({ message: 'User not found' });
			}

			const permission = await Permission.find({
				where: {
					user: user,
					calendar: calendar,
				},
			});
			if (permission?.length > 0) {
				return res.status(400).json({ message: 'User is already in the calendar' });
			}

			const newPermission = await Permission.create({
				user: user,
				calendar: calendar,
			});
			await newPermission.save();
			// await calendar.save();

			return res.status(200).json({ message: 'User successfully added to the calendar' });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: 'Error adding user to calendar' });
		}
	},

	// async removeUserFromCalendar(req: Request, res: Response): Promise<Response> {
	// 	const { calendarId } = req.params;
	// 	const { email, login } = req.body;

	// 	if (!email && !login) {
	// 		return res.status(400).json({ message: 'Email or login is required' });
	// 	}

	// 	try {
	// 		const calendar = await Calendar.findOne({
	// 			where: { id: calendarId },
	// 		});

	// 		if (!calendar) {
	// 			return res.status(404).json({ message: 'Calendar not found' });
	// 		}

	// 		const user = await User.findOne({
	// 			where: email ? { email } : { login },
	// 		});

	// 		if (!user) {
	// 			return res.status(404).json({ message: 'User not found' });
	// 		}

	// 		const permission = await Permission.findOne({
	// 			where: {
	// 				user: user,
	// 				calendar: calendar,
	// 			},
	// 		});

	// 		if (!permission) {
	// 			return res.status(404).json({ message: 'User is not in the calendar' });
	// 		}

	// 		await permission.remove();

	// 		return res.status(200).json({ message: 'User successfully removed from the calendar' });
	// 	} catch (error) {
	// 		console.error(error);
	// 		return res.status(500).json({ message: 'Error removing user from calendar' });
	// 	}
	// },

	async getEventsInCalendar(req: Request, res: Response): Promise<Response> {
		const { calendarId } = req.params;
		const { start, end } = req.query;

		try {
			const calendar = await Calendar.findOne({
				where: { id: calendarId },
				relations: ['events'],
			});

			if (!calendar) {
				return res.status(404).json({ message: 'Calendar not found' });
			}
			const events = await Event.find({
				where: {
					calendar: {id: calendarId},
					startDate: start ? MoreThanOrEqual(new Date(start as string)) : undefined,
					endDate: end ? LessThanOrEqual(new Date(end as string)) : undefined,
				},
			});

			return res.status(200).json({ events });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: 'Error fetching events' });
		}
	},

	async createEventInCalendar(req: Request, res: Response): Promise<Response> {
		const { calendarId } = req.params;
		const { title, description, startDate, endDate } = req.body;

		try {
			const calendar = await Calendar.findOne({ where: { id: calendarId } });

			if (!calendar) {
				return res.status(404).json({ message: 'Calendar not found' });
			}

			const event = new Event();
			event.title = title;
			event.description = description;
			event.startDate = new Date(startDate);
			event.endDate = new Date(endDate);
			event.calendar = calendar;

			await event.save();

			return res.status(201).json({ message: `Event created in calendar with ID: ${calendarId}`, event });
		} catch (error) {
			console.log(error);
			return res.status(500).json({ message: 'Error creating event' });
		}
	},

	async inviteUser(req: Request, res: Response): Promise<Response> {
		const { calendarId } = req.params;
		const { email, role } = req.body; // Роль передается в теле запроса
		const userId = req.user.id; // Авторизованный пользователь

		try {
			const calendar = await Calendar.findOne({ where: { id: calendarId } });
			if (!calendar) {
				return res.status(404).json({ message: 'Calendar not found' });
			}

			// Проверяем, является ли отправитель владельцем календаря
			const ownerPermission = await Permission.findOne({
				where: { calendar, user: { id: String(userId) }, role: In(['owner', 'manager']) },
			});

			if (!ownerPermission) {
				return res.status(403).json({ message: 'Only the calendar owner can invite users' });
			}

			// Генерируем токен приглашения с email и ролью
			const inviteToken = sign({ email, calendarId, role }, process.env.SECRET_KEY!, { expiresIn: '7d' });
			const inviteUrl = `${process.env.FRONT_URL}/join/${inviteToken}`;

			// Отправляем письмо с приглашением (добавлен 4-й аргумент 'calendar')
			await sendInviteEmail(email, inviteUrl, role, 'calendar');

			return res.json({ message: 'Invitation sent successfully' });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: 'Error sending invitation' });
		}
	},

	async joinCalendar(req: Request, res: Response): Promise<Response> {
		const { inviteToken } = req.params;
		const userId = req.user.id; // Авторизованный пользователь

		try {
			// Расшифровываем токен
			const decoded: any = verify(inviteToken, process.env.SECRET_KEY!);
			if (!decoded) {
				return res.status(400).json({ message: 'Invalid or expired invite token' });
			}

			const { email, calendarId, role } = decoded;

			// Ищем пользователя по ID
			const user = await User.findOne({ where: { id: String(userId) } });
			if (!user) {
				return res.status(404).json({ message: 'User not found' });
			}

			// Проверяем, что email совпадает
			if (user.email !== email) {
				return res.status(403).json({ message: 'This invite is not for you' });
			}

			// Проверяем, что пользователь еще не добавлен в календарь
			const existingPermission = await Permission.findOne({ where: { user, calendar: { id: calendarId } } });
			if (existingPermission) {
				return res.status(400).json({ message: 'User is already in the calendar' });
			}

			// Добавляем пользователя с указанной ролью
			const newPermission = Permission.create({ user, calendar: { id: calendarId }, role });
			await newPermission.save();

			return res.json({ message: 'Successfully joined the calendar' });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: 'Error joining calendar' });
		}
	},

	async removeUserFromCalendar(req: Request, res: Response) {
		const { calendarId, userId } = req.params;

		try {
			const permission = await Permission.findOne({ where: { calendar: { id: calendarId }, user: { id: userId } } });

			if (!permission) {
				return res.status(404).json({ message: 'User not found in calendar' });
			}

			await Permission.remove(permission);
			return res.json({ message: 'User removed from calendar successfully' });
		} catch (error) {
			console.error('Error removing user from calendar:', error);
			return res.status(500).json({ message: 'Internal server error' });
		}
	},
};
