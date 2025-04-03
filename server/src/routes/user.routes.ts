import { Router } from 'express';
import { UserController } from '../controllers/UserController';

const router = Router();

// TODO: what is bind and why it does not work without it
// Create a new user
router.post('/', UserController.createUser.bind(UserController));

// // Get all users
router.get('/', UserController.getUsers.bind(UserController));

// // Get a specific user by ID
router.get('/:id', UserController.getUserById.bind(UserController));

// // Update a user's information
router.patch('/:id', UserController.updateUser.bind(UserController));

// // Delete a user
router.delete('/:id', UserController.deleteUser.bind(UserController));

// // Get all calendars owned by a user
router.get('/:id/owned-calendars', UserController.getOwnedCalendars.bind(UserController));

// // Get all shared calendars for a user
router.get('/:id/shared-calendars', UserController.getSharedCalendars.bind(UserController));

router.get('/:id/shared-events', UserController.getSharedEvents.bind(UserController));

export default router;
