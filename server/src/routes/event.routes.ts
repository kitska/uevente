import { Router } from 'express';
import { EventController } from '../controllers/EventController';
const multer = require('multer');
const upload = multer();

const router = Router();

router.get('/first-five-events', EventController.getFirstFiveEvents.bind(EventController));
router.get('/', EventController.getAllEvents.bind(EventController));
router.post('/', EventController.createEvent.bind(EventController));
router.post('/upload-poster', upload.single('file'), EventController.uploadPoster.bind(EventController));
router.get('/:id', EventController.getEventById.bind(EventController));
router.patch('/:id', EventController.updateEvent.bind(EventController));
router.delete('/:id', EventController.deleteEvent.bind(EventController));
router.post('/decrease-tickets', EventController.decreaseTickets.bind(EventController));
router.get('/subscriptions/:eventId/count', EventController.getEventSubscriptionCount.bind(EventController));
router.get('/:eventId/attendees', EventController.getEventAttendees.bind(EventController));

export default router;

// import { Router } from 'express';
// import { EventController } from '../controllers/EventController';
// import { authMiddleware } from '../middlewares/Auth';

// const router = Router();

// router.get('/', EventController.getAllEvents.bind(EventController));
// router.get('/location', EventController.getEventsByLocation.bind(EventController));
// router.get('/:eventId', EventController.getEventById.bind(EventController));
// router.get('/calendar/:calendarId', EventController.getEventsByCalendar.bind(EventController));
// router.post('/calendar/:calendarId', authMiddleware, EventController.createEvent.bind(EventController));
// router.post('/calendar/repeat/:calendarId', authMiddleware, EventController.createSequenceEvent.bind(EventController));
// router.patch('/:eventId', authMiddleware, EventController.updateEvent.bind(EventController));
// router.delete('/:eventId', authMiddleware, EventController.deleteEvent.bind(EventController));
// router.get('/:eventId/users', EventController.getEventUsers.bind(EventController));

// // // Пригласительная ссылка в событие
// router.post('/invite/:eventId', authMiddleware, EventController.inviteUserToEvent.bind(EventController));
// router.post('/join/:inviteToken', authMiddleware, EventController.joinEvent.bind(EventController));
// router.delete('/:eventId/users/:userId', EventController.removeUserFromEvent.bind(EventController));

// export default router;
