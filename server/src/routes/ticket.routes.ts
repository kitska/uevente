import { Router } from 'express';
import { TicketController } from '../controllers/TicketController';

const router = Router();

router.post('/', TicketController.createTicket.bind(TicketController));

router.post('/decode', TicketController.decodeQRCode.bind(TicketController));

router.get('/event/:eventId', TicketController.getTicketsByEvent.bind(TicketController));

router.get('/:ticketId', TicketController.getTicketById.bind(TicketController));

export default router;
