import express from 'express';
import userRoutes from './user.routes';
import userProfileRoutes from './user-profile.routes';
import kycRoutes from './kyc.routes';
import { createRateLimiter } from '../middlewares/rate-limit.middleware';
import { KYCController } from '../controller/kyc.controller';
import { UserController } from '../controller/user.controller';
import { UserProfileController } from '../controller/user-profile.controller';

const router = (userController: UserController, userProfileController: UserProfileController, kycController: KYCController) => {
  const apiRouter = express.Router();
  apiRouter.use(createRateLimiter());

  apiRouter.use('/users', userRoutes(userController));
  apiRouter.use('/profiles', userProfileRoutes(userProfileController));
  apiRouter.use('/kyc', kycRoutes(kycController));

  return apiRouter;
};

export default router;
