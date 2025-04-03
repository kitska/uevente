import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User'; // Adjust the path to point to the correct location
interface DecodedToken {
	id: number;
	email: string;
}

declare global {
	namespace Express {
		interface Request {
			user?: DecodedToken | User; // Теперь можно использовать либо DecodedToken, либо User
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

		// Присваиваем данные с типом DecodedToken
		req.user = {
			id: decoded.id,
			email: decoded.email,
		};

		next();
	} catch (error) {
		res.status(401).json({ message: 'Invalid or expired token' });
	}
};
