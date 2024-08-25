import { AuthPayload } from '@cash-daddy/shared';

export interface IAuthService {
  generateToken(payload: AuthPayload): string;
  verifyToken(token: string): AuthPayload;
}
