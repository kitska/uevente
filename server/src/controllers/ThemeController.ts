import { Request, Response } from 'express';
import { Theme } from '../models/Theme';
import { Event } from '../models/Event';

export class ThemeController {
	static async getAllThemes(req: Request, res: Response) {
		try {
			const themes = await Theme.find();
			return res.status(200).json(themes);
		} catch (error) {
			console.error('Error fetching themes:', error);
			return res.status(500).json({ message: 'Failed to fetch themes' });
		}
	}

	static async getThemeById(req: Request, res: Response) {
		const { id } = req.params;

		try {
			const theme = await Theme.findOne({ where: { id } });
			if (!theme) return res.status(404).json({ message: 'Theme not found' });

			return res.status(200).json(theme);
		} catch (error) {
			console.error('Error fetching theme:', error);
			return res.status(500).json({ message: 'Failed to fetch theme' });
		}
	}

	static async createTheme(req: Request, res: Response) {
		const { title } = req.body;

		if (!title) return res.status(400).json({ message: 'Title is required' });

		try {
			const theme = Theme.create({ title });
			await theme.save();
			return res.status(201).json(theme);
		} catch (error) {
			console.error('Error creating theme:', error);
			return res.status(500).json({ message: 'Failed to create theme' });
		}
	}

	static async updateTheme(req: Request, res: Response) {
		const { id } = req.params;
		const { title } = req.body;

		try {
			const theme = await Theme.findOne({ where: { id } });
			if (!theme) return res.status(404).json({ message: 'Theme not found' });

			if (title !== undefined) theme.title = title;
			await theme.save();

			return res.status(200).json(theme);
		} catch (error) {
			console.error('Error updating theme:', error);
			return res.status(500).json({ message: 'Failed to update theme' });
		}
	}

	static async deleteTheme(req: Request, res: Response) {
		const { id } = req.params;

		try {
			const theme = await Theme.findOne({ where: { id } });
			if (!theme) return res.status(404).json({ message: 'Theme not found' });

			await theme.remove();
			return res.status(200).json({ message: 'Theme deleted' });
		} catch (error) {
			console.error('Error deleting theme:', error);
			return res.status(500).json({ message: 'Failed to delete theme' });
		}
	}

	static async getEventsByTheme(req: Request, res: Response) {
		const { id } = req.params;

		try {
			const theme = await Theme.findOne({ where: { id } });
			if (!theme) return res.status(404).json({ message: 'Theme not found' });

			const events = await Event.createQueryBuilder('event')
				.leftJoinAndSelect('event.company', 'company')
				.leftJoinAndSelect('event.formats', 'formats')
				.leftJoinAndSelect('event.themes', 'themes')
				.where('themes.id = :id', { id })
				.getMany();

			return res.status(200).json(events);
		} catch (error) {
			console.error('Error fetching events by theme:', error);
			return res.status(500).json({ message: 'Failed to fetch events for theme' });
		}
	}
}
