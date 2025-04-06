import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
interface DecodedToken {
	id: number;
	email: string;
	isAdmin: boolean
}

declare global {
	namespace Express {
		interface Request {
			user?: DecodedToken | User;
		}
	}
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
	const token = req.headers.authorization?.split(' ')[1];

	if (!token) {
		res.status(403).json({ message: 'Access denied, no token provided' });
	}

	try {
		const decoded = jwt.verify(token, process.env.SECRET_KEY!) as DecodedToken;

		req.user = {
			id: decoded.id,
			email: decoded.email,
			isAdmin: decoded.isAdmin
		};

		next();
	} catch (error) {
		res.status(401).json({ message: 'Invalid or expired token' });
	}
};

export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
	const token = req.headers.authorization?.split(' ')[1];

	if (!token) {
		res.status(403).json({ message: 'Access denied, no token provided' });
	}

	try {
		const decoded = jwt.verify(token, process.env.SECRET_KEY!) as DecodedToken;

		req.user = {
			id: decoded.id,
			email: decoded.email,
			isAdmin: decoded.isAdmin
		};
		if(!isAdmin) res.status(403).json({ message: 'Only admin user can do it' });
		next();
	} catch (error) {
		res.status(401).json({ message: 'Invalid or expired token' });
	}
};
