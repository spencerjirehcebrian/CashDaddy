import { CreateRateLimiter } from '@cash-daddy/shared';
import express from 'express';
import walletRoutes from './wallet.routes.js';
const router = (walletController, authMiddleware) => {
    const apiRouter = express.Router();
    apiRouter.use(CreateRateLimiter());
    apiRouter.use('/wallet', walletRoutes(walletController, authMiddleware));
    return apiRouter;
};
export default router;
