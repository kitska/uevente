import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { sendResetPasswordEmail, sendConfirmationEmail } from '../utils/emailService';
import { isAdmin } from '../middlewares/Auth';

interface ConfirmNewPasswordParams {
	token: string;
}
interface ConfirmNewPasswordBody {
	newPassword: string;
}

export const AuthController = {
	async register(req: Request, res: Response): Promise<Response> {
		const { fullName, email, password, login }: { fullName: string; email: string; password: string; login: string } = req.body;

		try {
			const existingUser = await User.findOne({
				where: [
					{ email: email },
					{ login: login }
				]
			});
			if (existingUser) {
				return res.status(400).json({ message: 'Email or login already in use' });
			}

			const newUser = User.create({
				login,
				fullName,
				email,
				password
			});


			await newUser.save();

			const token = jwt.sign({ email: newUser.email }, process.env.SECRET_KEY!, { expiresIn: '1d' });
			await sendConfirmationEmail(newUser.email, token);

			return res.status(201).json({ message: 'User registered successfully. Please confirm your email.' });
		} catch (error) {
			console.error('Error registering user:', error);
			return res.status(500).json({ message: 'Failed to register user' });
		}
	},

	async me(req: Request, res: Response): Promise<Response> {
		try {
			const { token } = req.body;

			if (!token) {
				return res.status(401).json({ error: 'Unauthorized' });
			}

			const decoded: any = jwt.verify(token, process.env.SECRET_KEY!);

			const user = await User.findOne({
				where: { id: decoded.id },
				// select: ['id', 'fullName', 'email', 'login', 'isEmailConfirmed', 'profilePicture', 'isAdmin', 'isShowName', 'rating', 'emailNotifications', 'pushNotifications', 'smsNotifications'],
			});

			if (!user) {
				return res.status(404).json({ error: 'User not found' });
			}

			return res.status(200).json({ user });
		} catch (error) {
			console.error('Error retrieving user:', error);

			if (error.name === 'TokenExpiredError') {
				return res.status(401).json({ error: 'Token has expired' });
			} else if (error.name === 'JsonWebTokenError') {
				return res.status(401).json({ error: 'Invalid token' });
			}

			return res.status(500).json({ error: 'Could not retrieve user information' });
		}
	},

	async confirmEmail(req: Request, res: Response): Promise<Response> {
		const { token } = req.params;

		try {
			const decoded: any = jwt.verify(token, process.env.SECRET_KEY!);

			const user = await User.findOne({ where: { email: decoded.email } });
			if (!user) {
				return res.status(404).json({ message: 'User not found' });
			}

			user.isEmailConfirmed = true;
			await user.save();

			return res.status(200).json({ message: 'Email successfully confirmed' });
		} catch (error) {
			return res.status(400).json({ message: 'Invalid or expired token' });
		}
	},

	async login(req: Request, res: Response): Promise<Response> {
		const { email, login, password }: { email?: string; login?: string; password: string } = req.body;
		// console.log(email, password, login);

		if (!password || (!email && !login)) {
			return res.status(400).json({ message: 'Email or login and password are required' });
		}


		try {
			const user = await User.findOne({
				where: email ? { email } : { login },
			});

			if (!user) {
				return res.status(400).json({ message: 'Invalid credentials' });
			}

			const isPasswordValid = await bcrypt.compare(password, user.password);
			if (!isPasswordValid) {
				return res.status(401).json({ message: 'Invalid credentials' });
			}

			const token = jwt.sign(
				{
					id: user.id,
					isAdmin: user.isAdmin
				},
				process.env.SECRET_KEY!,
				{ expiresIn: '7d' }
			);

			const { password: _, ...userData } = user;


			return res.status(200).json({ message: 'Login successful', userData, token });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: 'Login failed' });
		}
	},

	async logout(req: Request, res: Response): Promise<Response> {
		return res.status(200).json({ message: 'Came out, good chel' });
	},

	async sendResetLink(req: Request, res: Response): Promise<Response> {
		const { email }: { email: string } = req.body;


		try {
			const user = await User.findOne({ where: { email } });
			if (!user) {
				return res.status(404).json({ message: 'User not found' });
			}

			const token = jwt.sign({ email: user.email }, process.env.SECRET_KEY!, { expiresIn: '1h' });

			await sendResetPasswordEmail(user.email, token);

			return res.status(200).json({ message: 'Password reset link sent to your email' });
		} catch (error) {
			return res.status(500).json({ message: 'Failed to send reset link' });
		}
	},

	async confirmNewPassword(req: Request<ConfirmNewPasswordParams, any, ConfirmNewPasswordBody>, res: Response): Promise<Response> {
		const { token } = req.params;
		let { newPassword }: { newPassword: string } = req.body;

		try {
			const decoded: any = jwt.verify(token, process.env.SECRET_KEY!);
			const user = await User.findOne({ where: { email: decoded.email } });

			if (!user) {
				return res.status(404).json({ message: 'User not found' });
			}

			newPassword = String(newPassword);

			if (newPassword.trim() === '') {
				return res.status(400).json({ message: 'Invalid password' });
			}

			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(newPassword, salt);

			await user.save();

			return res.status(200).json({ message: 'Password successfully updated' });
		} catch (error) {
			console.log(error);
			return res.status(400).json({ message: 'Invalid or expired token' });
		}
	},
	async createFulluser(req: Request, res: Response): Promise<Response> {
		const { fullName, email, password, login, profilePicture, isAdmin, isShowName, rating, isEmailConfirmed }:
			{ fullName: string; email: string; password: string; login: string; profilePicture: string; isAdmin: boolean; isShowName: boolean; rating: number; isEmailConfirmed: boolean; } = req.body;

		try {
			const newUser = User.create({
				login,
				fullName,
				email,
				password,
				profilePicture,
				isAdmin, 
				isShowName,
				rating,
				isEmailConfirmed
			});


			await newUser.save();
			if(!newUser.isEmailConfirmed) {
				const token = jwt.sign({ email: newUser.email }, process.env.SECRET_KEY!, { expiresIn: '1d' });
				await sendConfirmationEmail(newUser.email, token);
			}

			return res.status(201).json({ message: 'User registered successfully. Please confirm your email.' });
		} catch (error) {
			console.error('Error registering user:', error);
			return res.status(500).json({ message: 'Failed to register user' });
		}
	},
};
