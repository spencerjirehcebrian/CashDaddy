import jwt from 'jsonwebtoken';
import { config } from '../../config/index.js';
import { NotAuthorizedError } from '@cash-daddy/shared';
const JWT_SECRET = config.JWT_SECRET;
export class AuthService {
    generateToken(payload) {
        return jwt.sign(payload, JWT_SECRET, { expiresIn: '6h' });
    }
    verifyToken(token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            return decoded;
        }
        catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new NotAuthorizedError('Token has expired');
            }
            throw new NotAuthorizedError('Invalid token');
        }
    }
}
