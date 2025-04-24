import { Request, Response } from 'express';
import { Payment } from '../models/Payment';
import { Event } from '../models/Event';
import { User } from '../models/User';
import { Promocode } from '../models/Promocode';

export class PaymentController {
	static async create(req: Request, res: Response) {
		const { userId, eventId, amount, status, promocodeId } = req.body;

		try {
			const user = await User.findOneBy({ id: userId });
			const event = await Event.findOneBy({ id: eventId });

			if (!user || !event) {
				return res.status(404).json({ message: 'User or event not found' });
			}

			const promocode = promocodeId ? await Promocode.findOneBy({ id: promocodeId }) : null;

			const payment = Payment.create({ user, event, amount, status, promocode });
			await payment.save();

			return res.status(201).json({ message: 'Payment created', payment });
		} catch (error) {
			console.error('Error creating payment:', error);
			return res.status(500).json({ message: 'Internal server error' });
		}
	}

	static async update(req: Request, res: Response) {
		const { id } = req.params;
		const { status } = req.body;

		try {
			const payment = await Payment.findOneBy({ id });

			if (!payment) {
				return res.status(404).json({ message: 'Payment not found' });
			}

			payment.status = status || payment.status;
			await payment.save();

			return res.status(200).json({ message: 'Payment updated', payment });
		} catch (error) {
			console.error('Error updating payment:', error);
			return res.status(500).json({ message: 'Internal server error' });
		}
	}

	static async getAll(req: Request, res: Response) {
		try {
			const payments = await Payment.find({
				relations: ['user', 'event', 'promocode'],
			});
			return res.status(200).json(payments);
		} catch (error) {
			console.error('Error fetching payments:', error);
			return res.status(500).json({ message: 'Internal server error' });
		}
	}

	static async delete(req: Request, res: Response) {
		const { id } = req.params;

		try {
			const payment = await Payment.findOneBy({ id });

			if (!payment) {
				return res.status(404).json({ message: 'Payment not found' });
			}

			await payment.remove();
			return res.status(200).json({ message: 'Payment deleted' });
		} catch (error) {
			console.error('Error deleting payment:', error);
			return res.status(500).json({ message: 'Internal server error' });
		}
	}
}
