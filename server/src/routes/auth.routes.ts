import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middlewares/Auth';

const router = Router();

router.post('/register', AuthController.register.bind(AuthController));
router.get('/confirm-email/:token', AuthController.confirmEmail.bind(AuthController));
router.post('/me', AuthController.me.bind(AuthController));
router.post('/login', AuthController.login.bind(AuthController));
router.post('/logout', authMiddleware, AuthController.logout.bind(AuthController));
router.post('/password-reset', AuthController.sendResetLink.bind(AuthController));
router.post('/password-reset/:token', AuthController.confirmNewPassword.bind(AuthController));

export default router;
