import { AuthMiddleware, CreateRateLimiter } from '@cash-daddy/shared';
import express from 'express';
import { PaymentController } from '../controller/payment.controller.js';
import paymentRoutes from './payment.routes.js';
import { QRPaymentController } from 'src/controller/qr.payment.controller.js';

const router = (paymentController: PaymentController, authMiddleware: AuthMiddleware, qrPaymentController: QRPaymentController) => {
  const apiRouter = express.Router();
  apiRouter.use(CreateRateLimiter());
  apiRouter.use('/payment', paymentRoutes(paymentController, authMiddleware, qrPaymentController));

  return apiRouter;
};

export default router;
