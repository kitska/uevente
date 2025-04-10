import { Router } from 'express';
import { ThemeController } from '../controllers/ThemeController';

const router = Router();

router.get('/', ThemeController.getAllThemes.bind(ThemeController));
router.get('/:id', ThemeController.getThemeById.bind(ThemeController));
router.post('/', ThemeController.createTheme.bind(ThemeController));
router.patch('/:id', ThemeController.updateTheme.bind(ThemeController));
router.delete('/:id', ThemeController.deleteTheme.bind(ThemeController));
router.get('/:id/events', ThemeController.getEventsByTheme.bind(ThemeController));

export default router;
