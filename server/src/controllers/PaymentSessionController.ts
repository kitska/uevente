import { Request, Response } from 'express';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_API_KEY!);

export const createCheckoutSession = async (req: Request, res: Response) => {
	const { items } = req.body;

	try {
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			line_items: items.map((item: { name: string; amount: number; quantity: number }) => ({
				price_data: {
					currency: 'usd',
					product_data: {
						name: item.name,
					},
					unit_amount: item.amount,
				},
				quantity: item.quantity,
			})),
			mode: 'payment',
			success_url: `${process.env.FRONT_URL}/success`,
			cancel_url: `${process.env.FRONT_URL}/cancel`,
		});

		res.json({ sessionId: session.id });
	} catch (error: any) {
		console.error('Error creating checkout session:', error);
		res.status(500).json({ error: error.message });
	}
};