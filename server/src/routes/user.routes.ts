import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middlewares/Auth';
import multer from 'multer';
import path from 'path';

const router = Router();

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, path.join(__dirname, '../..', 'uploads'));
	},
	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname); // Get the correct file extension
		const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
		cb(null, filename);
	},
});

const upload = multer({ storage });

router.post('/:id/avatar', authMiddleware, upload.single('avatar'), UserController.uploadAvatar.bind(UserController));
router.post('/', UserController.createUser.bind(UserController));
router.get('/subscriptions/:userId', UserController.getUserSubscriptions.bind(UserController));
// router.get('/', UserController.getUsers.bind(UserController));
// router.get('/:id', UserController.getUserById.bind(UserController));
// router.patch('/:id', UserController.updateUser.bind(UserController));
// router.delete('/:id', UserController.deleteUser.bind(UserController));
// router.get('/:id/owned-calendars', UserController.getOwnedCalendars.bind(UserController));
// router.get('/:id/shared-calendars', UserController.getSharedCalendars.bind(UserController));
// router.get('/:id/shared-events', UserController.getSharedEvents.bind(UserController));

export default router;
