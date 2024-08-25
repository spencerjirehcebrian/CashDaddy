import jwt from 'jsonwebtoken';
import { config } from '../../config/index.js';
import { IAuthService } from '../../interfaces/services/auth-service.interface.js';
import { AuthPayload, NotAuthorizedError } from '@cash-daddy/shared';

const JWT_SECRET = config.JWT_SECRET!;

export class AuthService implements IAuthService {
  generateToken(payload: AuthPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  }
  verifyToken(token: string): AuthPayload {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new NotAuthorizedError('Token has expired');
      }
      throw new NotAuthorizedError('Invalid token');
    }
  }
}
