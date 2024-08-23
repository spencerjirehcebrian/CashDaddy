declare module '@cash-daddy/shared' {
  export * from '@cash-daddy/shared/dist/esm/index.js';
}

import { AuthPayload } from '@cash-daddy/shared';

// Augment the Express namespace
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}