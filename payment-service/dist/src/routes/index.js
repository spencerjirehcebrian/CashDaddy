import { CreateRateLimiter } from '@cash-daddy/shared';
import express from 'express';
import kycRoutes from './payment.routes.js';
const router = (paymentController, authMiddleware) => {
    const apiRouter = express.Router();
    apiRouter.use(CreateRateLimiter());
    apiRouter.use('/payment', kycRoutes(paymentController, authMiddleware));
    return apiRouter;
};
export default router;
