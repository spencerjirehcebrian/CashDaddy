import { KYCController } from '@/controller/kyc.controller.js';
import { AuthMiddleware, CreateRateLimiter } from '@cash-daddy/shared';
import express from 'express';
import kycRoutes from './kyc.routes.js';

const router = (kycController: KYCController, authMiddleware: AuthMiddleware) => {
  const apiRouter = express.Router();
  apiRouter.use(CreateRateLimiter());
  apiRouter.use('/kyc', kycRoutes(kycController, authMiddleware));

  return apiRouter;
};

export default router;
