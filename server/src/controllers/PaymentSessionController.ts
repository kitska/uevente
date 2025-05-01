import { Request, Response } from 'express';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_API_KEY!);

export const createCheckoutSession = async (req: Request, res: Response) => {
	const { items, paymentId } = req.body;
	try {
		console.log(items);
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			line_items: items.map((item: { name: string; amount: number; quantity: number; image?: string }) => ({
				price_data: {
					currency: 'usd',
					unit_amount: item.amount,
					product_data: {
						name: item.name,
						images: item.image ? [item.image] : [],
					},
				},
				quantity: item.quantity,
			})),
			mode: 'payment',
			success_url: items[0].redirectURL || `${process.env.FRONT_URL}/success/${paymentId}`,
			cancel_url: `${process.env.FRONT_URL}/cancel/${paymentId}`,
		});

		res.json({ sessionId: session.id });
	} catch (error: any) {
		console.error('Error creating checkout session:', error);
		res.status(500).json({ error: error.message });
	}
};