declare module '@cash-daddy/shared' {
  export * from '@cash-daddy/shared/dist/types/decorators';
  export * from '@cash-daddy/shared/dist/types/interfaces';
  export * from '@cash-daddy/shared/dist/types/middlewares';
  export * from '@cash-daddy/shared/dist/types/services';
  export * from '@cash-daddy/shared/dist/types/types';
  export * from '@cash-daddy/shared/dist/types/utils';
}

import '@cash-daddy/shared';

declare global {
  namespace Express {
    interface Request {
      user?: import('@cash-daddy/shared').AuthPayload;
    }
  }
}