import { AuthMiddleware, CreateRateLimiter } from '@cash-daddy/shared';
import express from 'express';
import walletRoutes from './wallet.routes.js';
import { WalletController } from 'src/controller/wallet.controller.js';
const router = (walletController: WalletController, authMiddleware: AuthMiddleware) => {
  const apiRouter = express.Router();
  apiRouter.use(CreateRateLimiter());
  apiRouter.use('/wallet', walletRoutes(walletController, authMiddleware));

  return apiRouter;
};

export default router;
