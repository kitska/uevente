import { Router } from 'express';
import { FormatController } from '../controllers/FormatController';

const router = Router();

router.get('/', FormatController.getAllFormats.bind(FormatController));
router.get('/:id', FormatController.getFormatById.bind(FormatController));
router.post('/', FormatController.createFormat.bind(FormatController));
router.patch('/:id', FormatController.updateFormat.bind(FormatController));
router.delete('/:id', FormatController.deleteFormat.bind(FormatController));
router.get('/:id/events', FormatController.getEventsByFormat.bind(FormatController));

export default router;
