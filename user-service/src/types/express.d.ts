import { AuthPayload } from './auth.types';

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}
