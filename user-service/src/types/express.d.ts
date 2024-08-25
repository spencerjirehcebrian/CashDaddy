import { AuthPayload } from '@cash-daddy/shared';

// Augment the Express namespace
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}
