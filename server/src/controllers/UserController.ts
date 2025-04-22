import { Request, Response } from 'express';
import { User } from '../models/User';
import path from 'path';
import fs from 'fs';
import { Company } from '../models/Company'; // Добавим модель компании
import { Subscription } from '../models/Subscription';
// import { Ticket } from '../models/Ticket'; // Добавим модель билетов
// import { Subscription } from '../models/Subscription'; // Добавим модель подписок
// import { Notification } from '../models/Notification'; // Добавим модель уведомлений
interface MulterRequest extends Request {
	file: any;
}

const defaultAvatars = ['face_1.png', 'face_2.png', 'face_3.png', 'face_4.png', 'face_5.png'];
export class UserController {
	static async uploadAvatar(req: MulterRequest, res: Response): Promise<Response> {
		try {
			const userId = (req as any).user?.id;

			if (!userId) {
				return res.status(401).json({ error: 'Unauthorized' });
			}

			if (!req.file) {
				return res.status(400).json({ error: 'No file uploaded' });
			}
			const avatarFileName = req.file.filename;
			const newAvatarUrl = `${process.env.BASE_URL || 'http://localhost:8000'}/avatars/${avatarFileName}`;

			const user = await User.findOne({ where: { id: userId } });

			if (!user) {
				return res.status(404).json({ error: 'User not found' });
			}

			// Delete old avatar if it's not one of the default ones
			if (user.profilePicture) {
				const oldAvatarFileName = path.basename(user.profilePicture);
				if (!defaultAvatars.includes(oldAvatarFileName)) {
					const oldAvatarPath = path.join(__dirname, '..', 'uploads', oldAvatarFileName);
					if (fs.existsSync(oldAvatarPath)) {
						fs.unlinkSync(oldAvatarPath);
					}
				}
			}

			user.profilePicture = newAvatarUrl;
			await user.save();

			return res.status(200).json({ message: 'Avatar updated successfully', avatar: newAvatarUrl });
		} catch (error) {
			console.error('Avatar upload error:', error);
			return res.status(500).json({ error: 'Failed to update avatar' });
		}
	}

	// 	// Создание пользователя
	static async createUser(req: Request, res: Response): Promise<Response> {
		const { fullName, email, password, login, profilePicture, isAdmin, isShowName, rating, isEmailConfirmed } = req.body;

		// Проверка обязательных полей
		if (!fullName || !email || !password || !login) {
			return res.status(400).json({ message: 'All fields are required.' });
		}

		try {
			// Проверка, существует ли уже пользователь с таким email или login
			const existingUser = await User.findOne({
				where: [{ email: email }, { login: login }],
			});
			if (existingUser) {
				return res.status(409).json({ message: 'Email or login is already in use.' });
			}

			// Создание нового пользователя
			const user = User.create({
				fullName,
				email,
				password,
				login,
				profilePicture,
				isAdmin: isAdmin || false, // по умолчанию false
				isShowName: isShowName !== undefined ? isShowName : true, // по умолчанию true
				rating: rating || 0, // по умолчанию 0
				isEmailConfirmed: isEmailConfirmed || false, // по умолчанию false
			});

			// Хэшируем пароль перед сохранением
			user.password = password;

			// Сохраняем пользователя
			await user.save();

			return res.status(201).json({ message: 'User created successfully.', user });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: 'Internal server error.' });
		}
	}

	// 	// Получение всех пользователей
	static async getUsers(req: Request, res: Response): Promise<Response> {
		try {
			const users = await User.find();
			return res.status(200).json(users);
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: 'Internal server error.' });
		}
	}

	// 	// Получение пользователя по ID
	static async getUserById(req: Request, res: Response): Promise<Response> {
		const { id } = req.params;

		try {
			const user = await User.findOne({ where: { id: id } });
			if (!user) {
				return res.status(404).json({ message: 'User not found.' });
			}

			return res.status(200).json(user);
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: 'Internal server error.' });
		}
	}

	// 	// Обновление пользователя
	static async updateUser(req: Request, res: Response): Promise<Response> {
		const { id } = req.params;
		const { fullName, email, password, login, isEmailConfirmed, profilePicture, isAdmin, isShowName, rating, pushNotify, emailNotify, smsNotify } = req.body;

		try {
			// Ищем пользователя по ID
			const user = await User.findOneBy({ id: id });
			if (!user) {
				return res.status(404).json({ message: 'User not found.' });
			}

			// Обновляем поля пользователя
			if (fullName) user.fullName = fullName;
			if (email) user.email = email;
			if (login) user.login = login;
			if (password) user.password = password; // Хэшируем новый пароль
			if (isEmailConfirmed !== undefined) user.isEmailConfirmed = isEmailConfirmed;
			if (profilePicture) user.profilePicture = profilePicture;
			if (isAdmin !== undefined) user.isAdmin = isAdmin;
			if (isShowName !== undefined) user.isShowName = isShowName;
			if (rating !== undefined) user.rating = rating;
			if (pushNotify !== undefined) user.pushNotifications = pushNotify;
			if (emailNotify !== undefined) user.emailNotifications = emailNotify;
			if (smsNotify !== undefined) user.smsNotifications = smsNotify;

			// Сохраняем обновленного пользователя
			await user.save();

			return res.status(200).json({ message: 'User updated successfully.', user });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: 'Internal server error.' });
		}
	}

	// 	// Удаление пользователя
	static async deleteUser(req: Request, res: Response): Promise<Response> {
		const { id } = req.params;

		try {
			const user = await User.findOneBy({ id: id });
			if (!user) {
				return res.status(404).json({ message: 'User not found.' });
			}

			await user.remove();
			return res.status(200).json({ message: 'User deleted successfully.' });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: 'Internal server error.' });
		}
	}

	// 	// Получение всех компаний пользователя
	static async getUserCompanies(req: Request, res: Response): Promise<Response> {
		const { id } = req.params;

		try {
			const user = await User.findOne({ where: { id: id } });
			if (!user) {
				return res.status(404).json({ message: 'User not found.' });
			}

			// Получаем все компании, где пользователь является владельцем
			const companies = await Company.find({ where: { owner: { id: id } } });
			return res.status(200).json(companies);
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: 'Internal server error.' });
		}
	}

	static async getUserSubscriptions(req: Request, res: Response): Promise<Response> {
		const { userId } = req.params;

		try {
			const subscriptions = await Subscription.find({
				where: { user: { id: userId } },
				relations: ['event'],
			});

			return res.status(200).json(subscriptions);
		} catch (error) {
			console.error('Get subscriptions error:', error);
			return res.status(500).json({ message: 'Failed to fetch subscriptions' });
		}
	}

	// 	// Получение всех билетов пользователя
	// 	static async getUserTickets(req: Request, res: Response): Promise<Response> {
	// 		const { id } = req.params;

	// 		try {
	// 			const user = await User.findOne({ where: { id: id } });
	// 			if (!user) {
	// 				return res.status(404).json({ message: 'User not found.' });
	// 			}

	// 			// Получаем все билеты, приобретенные пользователем
	// 			const tickets = await Ticket.find({ where: { user: { id: id } } });
	// 			return res.status(200).json(tickets);
	// 		} catch (error) {
	// 			console.error(error);
	// 			return res.status(500).json({ message: 'Internal server error.' });
	// 		}
	// 	}

	// 	// Получение всех подписок пользователя
	// 	static async getUserSubscriptions(req: Request, res: Response): Promise<Response> {
	// 		const { id } = req.params;

	// 		try {
	// 			const user = await User.findOne({ where: { id: id } });
	// 			if (!user) {
	// 				return res.status(404).json({ message: 'User not found.' });
	// 			}

	// 			// Получаем все подписки пользователя на события
	// 			const subscriptions = await Subscription.find({ where: { user: { id: id } } });
	// 			return res.status(200).json(subscriptions);
	// 		} catch (error) {
	// 			console.error(error);
	// 			return res.status(500).json({ message: 'Internal server error.' });
	// 		}
	// 	}

	// 	// Получение всех уведомлений пользователя
	// 	static async getUserNotifications(req: Request, res: Response): Promise<Response> {
	// 		const { id } = req.params;

	// 		try {
	// 			const user = await User.findOne({ where: { id: id } });
	// 			if (!user) {
	// 				return res.status(404).json({ message: 'User not found.' });
	// 			}

	// 			// Получаем все уведомления для пользователя
	// 			const notifications = await Notification.find({ where: { user: { id: id } } });
	// 			return res.status(200).json(notifications);
	// 		} catch (error) {
	// 			console.error(error);
	// 			return res.status(500).json({ message: 'Internal server error.' });
	// 		}
	// 	}
}
