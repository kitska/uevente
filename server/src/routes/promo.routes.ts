import { Router } from 'express';
import { PromocodeController } from '../controllers/PromoController';

const router = Router();

router.post('/', PromocodeController.createPromocode.bind(PromocodeController));
router.get('/event/:eventId', PromocodeController.getPromocodesByEvent.bind(PromocodeController));
router.delete('/:id', PromocodeController.deletePromocode.bind(PromocodeController));

export default router;
