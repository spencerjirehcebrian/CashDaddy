import { AuthMiddleware, CreateRateLimiter } from '@cash-daddy/shared';
import express from 'express';
import kycRoutes from './payment.routes.js';
import { PaymentController } from '../controller/payment.controller.js';

const router = (paymentController: PaymentController, authMiddleware: AuthMiddleware) => {
  const apiRouter = express.Router();
  apiRouter.use(CreateRateLimiter());
  apiRouter.use('/payment', kycRoutes(paymentController, authMiddleware));

  return apiRouter;
};

export default router;
