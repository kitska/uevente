import { Router } from 'express';
import { SubscriptionController } from '../controllers/SubsciptionController';

const router = Router();

router.post('/subscribe', SubscriptionController.subscribe.bind(SubscriptionController));
router.post('/unsubscribe', SubscriptionController.unsubscribe.bind(SubscriptionController));


export default router;
