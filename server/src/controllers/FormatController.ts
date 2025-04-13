import { Request, Response } from 'express';
import { Format } from '../models/Format';
import { Event } from '../models/Event';

export class FormatController {
	static async getAllFormats(req: Request, res: Response) {
		try {
			const formats = await Format.find();
			return res.status(200).json(formats);
		} catch (error) {
			console.error('Error fetching formats:', error);
			return res.status(500).json({ message: 'Failed to fetch formats' });
		}
	}

	static async getFormatById(req: Request, res: Response) {
		const { id } = req.params;

		try {
			const format = await Format.findOne({ where: { id } });
			if (!format) return res.status(404).json({ message: 'Format not found' });

			return res.status(200).json(format);
		} catch (error) {
			console.error('Error fetching format:', error);
			return res.status(500).json({ message: 'Failed to fetch format' });
		}
	}

	static async createFormat(req: Request, res: Response) {
		const { title } = req.body;

		if (!title) return res.status(400).json({ message: 'Title is required' });

		try {
			const format = Format.create({ title });
			await format.save();
			return res.status(201).json(format);
		} catch (error) {
			console.error('Error creating format:', error);
			return res.status(500).json({ message: 'Failed to create format' });
		}
	}

	static async updateFormat(req: Request, res: Response) {
		const { id } = req.params;
		const { title } = req.body;

		try {
			const format = await Format.findOne({ where: { id } });
			if (!format) return res.status(404).json({ message: 'Format not found' });

			if (title !== undefined) format.title = title;
			await format.save();

			return res.status(200).json(format);
		} catch (error) {
			console.error('Error updating format:', error);
			return res.status(500).json({ message: 'Failed to update format' });
		}
	}

	static async deleteFormat(req: Request, res: Response) {
		const { id } = req.params;

		try {
			const format = await Format.findOne({ where: { id } });
			if (!format) return res.status(404).json({ message: 'Format not found' });

			await format.remove();
			return res.status(200).json({ message: 'Format deleted' });
		} catch (error) {
			console.error('Error deleting format:', error);
			return res.status(500).json({ message: 'Failed to delete format' });
		}
	}

	static async getEventsByFormat(req: Request, res: Response) {
		const { id } = req.params;

		try {
			const format = await Format.findOne({ where: { id } });
			if (!format) return res.status(404).json({ message: 'Format not found' });

			const events = await Event.createQueryBuilder('event')
				.leftJoinAndSelect('event.company', 'company')
				.leftJoinAndSelect('event.formats', 'formats')
				.leftJoinAndSelect('event.themes', 'themes')
				.where('formats.id = :id', { id })
				.getMany();

			return res.status(200).json(events);
		} catch (error) {
			console.error('Error fetching events by format:', error);
			return res.status(500).json({ message: 'Failed to fetch events for format' });
		}
	}
}
