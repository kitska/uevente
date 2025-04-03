import { Request, Response } from 'express';
import { Calendar } from '../models/Calendar';
import { User } from '../models/User';
import { AppDataSource } from '../database/data-source';
import { Event } from '../models/Event';
import bcrypt from 'bcrypt';
import { Permission } from '../models/Permission';
import { IsNull, Not } from "typeorm";

export class UserController {
	//     // Create a new user
	static async createUser(req: Request, res: Response): Promise<Response> {
		const { fullName, email, password, login } = req.body;
		if (!fullName || !email || !password || !login) {
			return res.status(400).json({ message: 'All fields are required.' });
		}

		try {
			const existingUser = await User.findOne({
				where: [{ email: email }, { login: login }],
			});
			if (existingUser) {
				return res.status(409).json({ message: 'Email or login is already in use.' });
			}

			const user = User.create({ fullName, email, password, login });
			await user.save();

			return res.status(201).json({ message: 'User created successfully.', user });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: 'Internal server error.' });
		}
	}

	//     // Get a list of all users
	static async getUsers(req: Request, res: Response): Promise<Response> {
		try {
			const users = await User.find();
			return res.status(200).json(users);
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: 'Internal server error.' });
		}
	}

	//     // Get a single user by ID
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

	//     // Update a user's information
	static async updateUser(req: Request, res: Response): Promise<Response> {
		const { id } = req.params;
		const { fullName, email, password, login, isEmailConfirmed } = req.body;

		try {
			const user = await User.findOneBy({ id: id });
			if (!user) {
				return res.status(404).json({ message: 'User not found.' });
			}

			if (fullName) user.fullName = fullName;
			if (email) user.email = email;
			if (login) user.login = login;
			if (password) user.password = password;
			if (isEmailConfirmed !== undefined) user.isEmailConfirmed = isEmailConfirmed;

			await user.save();

			return res.status(200).json({ message: 'User updated successfully.', user });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: 'Internal server error.' });
		}
	}

	//     // Delete a user
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

	//     // Get all calendars owned by a user
	static async getOwnedCalendars(req: Request, res: Response): Promise<Response> {
		const { id } = req.params;
		// console.log(id);

		try {
			const user = await User.findOne({ where: { id: id } });
			if (!user) {
				return res.status(404).json({ message: 'User  not found.' });
			}
			const permissions = await Permission.find({
				where: {
					user: user,
					role: 'owner', // Only include "owner" role
					calendar: Not(IsNull()), // Ensure calendar is not null
				},
				relations: ['calendar'], // Load the associated calendar
			});
			// console.log(permissions);

			// Extract owned calendars
			const ownedCalendars = permissions
				.filter(permission => permission.calendar) // Extra safeguard against null calendars
				.map(permission => ({
					id: permission.calendar.id,
					name: permission.calendar.name,
					description: permission.calendar.description,
					// isActive: permission.calendar.isActive
					color: permission.calendar.color,
				}));

			return res.status(200).json(ownedCalendars);
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: 'Internal server error.' });
		}
	}

	//     // Get all shared calendars for a user
	static async getSharedCalendars(req: Request, res: Response): Promise<Response> {
		const { id } = req.params;

		try {
			const user = await User.findOne({ where: { id: id } });
			if (!user) {
				return res.status(404).json({ message: 'User  not found.' });
			}
			const permissions = await Permission.find({
				where: {
					user: user,
					role: Not<'owner' | 'editor' | 'viewer'>('owner'), // Explicitly set the type
					calendar: Not(IsNull()),
				},
				relations: ['calendar'],
			});
			// console.log(permissions);

			const sharedCalendars = permissions.map(permission => ({
				id: permission.calendar.id,
				name: permission.calendar.name,
				description: permission.calendar.description,
				role: permission.role,
				// isActive: permission.calendar.isActive
			}));

			return res.status(200).json(sharedCalendars);
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: 'Internal server error.' });
		}
	}

	static async getSharedEvents(req: Request, res: Response): Promise<Response> {
		const { id } = req.params;

		try {
			const user = await User.findOne({ where: { id: id } });
			if (!user) {
				return res.status(404).json({ message: 'User  not found.' });
			}
			const permissions = await Permission.find({
				where: {
					user: user,
					role: Not<'owner' | 'editor' | 'viewer'>('owner'), // Explicitly set the type
					event: Not(IsNull()),
				},
				relations: ['event'],
			});
			// console.log(permissions);

			const sharedEvents = permissions.map(permission => ({
				id: permission.event.id,
				title: permission.event.title,
				description: permission.event.description,
                startDate: permission.event.startDate,
                endDate: permission.event.endDate,
                color: permission.event.color,
                type: permission.event.type,
				role: permission.role,
				// isActive: permission.calendar.isActive
			}));

			return res.status(200).json(sharedEvents);
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: 'Internal server error.' });
		}
	}
};
