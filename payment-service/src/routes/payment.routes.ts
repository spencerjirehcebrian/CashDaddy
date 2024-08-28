import { AuthMiddleware, ZodValidation } from '@cash-daddy/shared';
import express from 'express';
import { PaymentController } from '../controller/payment.controller.js';
import {
  addPaymentMethodSchema,
  confirmPaymentIntentSchema,
  confirmQRPaymentSchema,
  createPaymentIntentSchema,
  generateQRSchema,
  initiateQRPaymentSchema
} from '../validators/payment-method.validator.js';
import { QRPaymentController } from '../controller/qr.payment.controller.js';

const router = (paymentController: PaymentController, authMiddleware: AuthMiddleware, qrPaymentController: QRPaymentController) => {
  const paymentRouter = express.Router();

  // Payment method routes
  paymentRouter.post(
    '/payment-methods',
    authMiddleware.requireKYCVerified,
    ZodValidation(addPaymentMethodSchema),
    paymentController.createPaymentMethod.bind(paymentController)
  );
  paymentRouter.get('/payment-methods', authMiddleware.requireKYCVerified, paymentController.getPaymentMethods.bind(paymentController));
  paymentRouter.delete(
    '/payment-methods/:paymentMethodId',
    authMiddleware.requireAuth,
    paymentController.deletePaymentMethod.bind(paymentController)
  );

  // // QR payment routes
  paymentRouter.post(
    '/generate-qr',
    authMiddleware.requireKYCVerified,
    ZodValidation(generateQRSchema),
    qrPaymentController.generatePaymentQR.bind(paymentController)
  );
  paymentRouter.post(
    '/initiate-qr-payment',
    authMiddleware.requireKYCVerified,
    ZodValidation(initiateQRPaymentSchema),
    qrPaymentController.initiateQRPayment.bind(paymentController)
  );
  paymentRouter.post(
    '/confirm-qr-payment',
    authMiddleware.requireKYCVerified,
    ZodValidation(confirmQRPaymentSchema),
    qrPaymentController.confirmQRPayment.bind(paymentController)
  );

  // Payment intent routes
  paymentRouter.post(
    '/create-payment-intent',
    authMiddleware.requireKYCVerified,
    ZodValidation(createPaymentIntentSchema),
    paymentController.createPaymentIntent.bind(paymentController)
  );
  paymentRouter.post(
    '/confirm-payment-intent',
    authMiddleware.requireKYCVerified,
    ZodValidation(confirmPaymentIntentSchema),
    paymentController.confirmPaymentIntent.bind(paymentController)
  );

  return paymentRouter;
};

export default router;
