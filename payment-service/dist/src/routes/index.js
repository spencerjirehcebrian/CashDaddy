import { CreateRateLimiter } from '@cash-daddy/shared';
import express from 'express';
import paymentRoutes from './payment.routes.js';
const router = (paymentController, authMiddleware, qrPaymentController) => {
    const apiRouter = express.Router();
    apiRouter.use(CreateRateLimiter());
    apiRouter.use('/payment', paymentRoutes(paymentController, authMiddleware, qrPaymentController));
    return apiRouter;
};
export default router;
