import { Router } from 'express';
import { createCheckoutSession } from '../controllers/PaymentSessionController';
import { PaymentController } from '../controllers/PaymentController';
import { authMiddleware } from '../middlewares/Auth';


const router = Router();

router.post('/create-checkout-session', authMiddleware, createCheckoutSession);
router.get('/', authMiddleware, PaymentController.getAll.bind(PaymentController));
router.post('/', authMiddleware, PaymentController.create.bind(PaymentController));
router.patch('/:id', authMiddleware, PaymentController.update.bind(PaymentController));
router.delete('/:id', authMiddleware, PaymentController.delete.bind(PaymentController));

export default router;