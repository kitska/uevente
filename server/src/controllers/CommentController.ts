import { Request, Response } from 'express';
import { Comment } from '../models/Comment';
import { Event } from '../models/Event';
import { User } from '../models/User';

export class CommentController {
	static async getCommentsByEvent(req: Request, res: Response) {
		const { eventId } = req.params;

		try {
			const event = await Event.findOne({ where: { id: eventId } });
			if (!event) return res.status(404).json({ message: 'Event not found' });

			const comments = await Comment.find({
				where: { event: { id: eventId } },
				relations: ['user'],
				order: { createdAt: 'ASC' },
			});

			return res.status(200).json(comments);
		} catch (error) {
			console.error('Error fetching comments for event:', error);
			return res.status(500).json({ message: 'Failed to fetch comments for event' });
		}
	}

	static async createComment(req: Request, res: Response) {
		const { eventId } = req.params;
		const { userId, content } = req.body;

		if (!content) return res.status(400).json({ message: 'Content is required' });

		try {
			const event = await Event.findOne({ where: { id: eventId } });
			if (!event) return res.status(404).json({ message: 'Event not found' });

			const user = await User.findOne({ where: { id: userId } });
			if (!user) return res.status(404).json({ message: 'User not found' });

			const comment = Comment.create({ content, event, user });
			await comment.save();

			return res.status(201).json(comment);
		} catch (error) {
			console.error('Error creating comment:', error);
			return res.status(500).json({ message: 'Failed to create comment' });
		}
	}

	static async deleteComment(req: Request, res: Response) {
		const { id } = req.params;

		try {
			const comment = await Comment.findOne({ where: { id } });
			if (!comment) return res.status(404).json({ message: 'Comment not found' });

			await comment.remove();
			return res.status(200).json({ message: 'Comment deleted' });
		} catch (error) {
			console.error('Error deleting comment:', error);
			return res.status(500).json({ message: 'Failed to delete comment' });
		}
	}
}
