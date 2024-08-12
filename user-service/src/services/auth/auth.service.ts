import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { AuthPayload } from '../../types/auth.types';

const JWT_SECRET = config.JWT_SECRET!;

export class AuthService {
  static generateToken(payload: AuthPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  }

  static verifyToken(token: string): AuthPayload {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  }
}
