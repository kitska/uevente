import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middlewares/Auth';
import { Request, Response } from 'express';

import Stripe from 'stripe';

const router = Router();

const stripe = new Stripe(process.env.STRIPE_API_KEY!);

// // Register route
router.post('/register', AuthController.register.bind(AuthController));

// // Confirm email route
router.get('/confirm-email/:token', AuthController.confirmEmail.bind(AuthController));

router.post('/me', AuthController.me.bind(AuthController));

// // Login route
router.post('/login', AuthController.login.bind(AuthController));

// // Logout route with middleware
router.post('/logout', authMiddleware, AuthController.logout.bind(AuthController));

router.post('/password-reset', AuthController.sendResetLink.bind(AuthController));

// Confirm new password route
router.post('/password-reset/:token', AuthController.confirmNewPassword.bind(AuthController));

router.post('/create-checkout-session', async (req: Request, res: Response) => {
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
	} catch (error) {
		console.error('Error creating checkout session:', error);
		res.status(500).json({ error: error.message }); // Return the error message for debugging
	}
});

export default router;
