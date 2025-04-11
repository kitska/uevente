import { Router } from 'express';
import { CommentController } from '../controllers/CommentController';

const router = Router();

router.get('/event/:eventId', CommentController.getCommentsByEvent.bind(CommentController));
router.post('/:eventId', CommentController.createComment.bind(CommentController));
router.delete('/:id', CommentController.deleteComment.bind(CommentController));

export default router;
