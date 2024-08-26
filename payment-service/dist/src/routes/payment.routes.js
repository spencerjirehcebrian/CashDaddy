import { ZodValidation } from '@cash-daddy/shared';
import express from 'express';
import { addPaymentMethodSchema } from '../validators/payment-method.validator.js';
const router = (paymentController, authMiddleware) => {
    const paymentRouter = express.Router();
    // Payment method routes
    paymentRouter.post('/payment-methods', authMiddleware.requireAuth, ZodValidation(addPaymentMethodSchema), paymentController.createPaymentMethod.bind(paymentController));
    paymentRouter.get('/payment-methods', authMiddleware.requireAuth, paymentController.getPaymentMethods.bind(paymentController));
    paymentRouter.delete('/payment-methods/:paymentMethodId', authMiddleware.requireAuth, paymentController.deletePaymentMethod.bind(paymentController));
    // // QR payment routes
    // paymentRouter.post('/generate-qr', authMiddleware.requireAuth, paymentController.generatePaymentQR.bind(paymentController));
    // paymentRouter.post('/initiate-qr-payment', authMiddleware.requireAuth, paymentController.initiateQRPayment.bind(paymentController));
    // paymentRouter.post('/confirm-qr-payment', authMiddleware.requireAuth, paymentController.confirmQRPayment.bind(paymentController));
    // Payment intent routes
    paymentRouter.post('/create-payment-intent', authMiddleware.requireAuth, paymentController.createPaymentIntent.bind(paymentController));
    paymentRouter.post('/confirm-payment-intent', authMiddleware.requireAuth, paymentController.confirmPaymentIntent.bind(paymentController));
    return paymentRouter;
};
export default router;
