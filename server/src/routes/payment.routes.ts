import { Router } from 'express';
import { createCheckoutSession } from '../controllers/PaymentSessionController';
import { authMiddleware } from '../middlewares/Auth';


const router = Router();

router.post('/create-checkout-session', authMiddleware, createCheckoutSession);

export default router;