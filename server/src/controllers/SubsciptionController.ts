import { Request, Response } from 'express';
import { Subscription } from '../models/Subscription';
import { User } from '../models/User';
import { Event } from '../models/Event';

export class SubscriptionController {
	static async subscribe(req: Request, res: Response): Promise<Response> {
		const { eventId, userId } = req.body;

		try {
			const user = await User.findOneBy({ id: userId });
			const event = await Event.findOneBy({ id: eventId });

			if (!user || !event) {
				return res.status(404).json({ message: 'User or Event not found' });
			}

			const existing = await Subscription.findOne({ where: { user: { id: userId }, event: { id: eventId } } });
			if (existing) {
				return res.status(400).json({ message: 'Already subscribed to this event' });
			}

			const subscription = Subscription.create({ user, event });
			await subscription.save();

			return res.status(201).json({ message: 'Subscribed successfully', subscription });
		} catch (error) {
			console.error('Subscribe error:', error);
			return res.status(500).json({ message: 'Failed to subscribe' });
		}
	}

	static async unsubscribe(req: Request, res: Response): Promise<Response> {
		const { eventId, userId } = req.body;

		try {
			const subscription = await Subscription.findOne({ where: { user: { id: userId }, event: { id: eventId } } });

			if (!subscription) {
				return res.status(404).json({ message: 'Subscription not found' });
			}

			await subscription.remove();

			return res.status(200).json({ message: 'Unsubscribed successfully' });
		} catch (error) {
			console.error('Unsubscribe error:', error);
			return res.status(500).json({ message: 'Failed to unsubscribe' });
		}
	}
}
