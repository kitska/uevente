import { Request, Response } from 'express';
import { Promocode } from '../models/Promocode';
import { Event } from '../models/Event';
import { randomBytes } from 'crypto';

export class PromocodeController {
	private static generateCode(): string {
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		const blockLength = 5;
		const blockCount = 3;
		let result = [];

		for (let i = 0; i < blockCount; i++) {
			let block = '';
			for (let j = 0; j < blockLength; j++) {
				const randomIndex = randomBytes(1)[0] % characters.length;
				block += characters[randomIndex];
			}
			result.push(block);
		}

		return result.join('-');
	}

	static async createPromocode(req: Request, res: Response): Promise<Response> {
		const { eventId, discount } = req.body;

		try {
			const event = await Event.findOneBy({ id: eventId });
			if (!event) {
				return res.status(404).json({ message: 'Event not found' });
			}

			const code = this.generateCode();

			const promocode = Promocode.create({ event, discount, code });
			await promocode.save();

			return res.status(201).json({ message: 'Promocode created', promocode });
		} catch (error) {
			console.error('Error creating promocode:', error);
			return res.status(500).json({ message: 'Failed to create promocode' });
		}
	}

	static async getPromocodesByEvent(req: Request, res: Response): Promise<Response> {
		const { eventId } = req.params;

		try {
			const promocodes = await Promocode.find({
				where: { event: { id: eventId } },
				relations: ['event'],
			});

			return res.status(200).json(promocodes);
		} catch (error) {
			console.error('Error fetching promocodes:', error);
			return res.status(500).json({ message: 'Failed to fetch promocodes' });
		}
	}

	static async deletePromocode(req: Request, res: Response): Promise<Response> {
		const { id } = req.params;

		try {
			const promocode = await Promocode.findOneBy({ id });
			if (!promocode) {
				return res.status(404).json({ message: 'Promocode not found' });
			}

			await promocode.remove();
			return res.status(200).json({ message: 'Promocode deleted' });
		} catch (error) {
			console.error('Error deleting promocode:', error);
			return res.status(500).json({ message: 'Failed to delete promocode' });
		}
	}
}
