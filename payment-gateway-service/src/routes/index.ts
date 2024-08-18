import express from 'express';
import userRoutes from './user.routes';
import userProfileRoutes from './user-profile.routes';
import kycRoutes from './kyc.routes';
import { createRateLimiter } from '../middlewares/rate-limit.middleware';
import { KYCController } from '../controller/kyc.controller';
import { UserController } from '../controller/user.controller';
import { UserProfileController } from '../controller/user-profile.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';

const router = (
  userController: UserController,
  userProfileController: UserProfileController,
  kycController: KYCController,
  authMiddleware: AuthMiddleware
) => {
  const apiRouter = express.Router();
  apiRouter.use(createRateLimiter());

  apiRouter.use('/users', userRoutes(userController, authMiddleware));
  apiRouter.use('/profiles', userProfileRoutes(userProfileController, authMiddleware));
  apiRouter.use('/kyc', kycRoutes(kycController, authMiddleware));

  return apiRouter;
};

export default router;
