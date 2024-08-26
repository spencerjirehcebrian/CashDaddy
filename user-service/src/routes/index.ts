import express from 'express';
import userRoutes from './user.routes.js';
import userProfileRoutes from './user-profile.routes.js';
import { UserController } from '../controller/user.controller.js';
import { UserProfileController } from '../controller/user-profile.controller.js';
import { AuthMiddleware, CreateRateLimiter } from '@cash-daddy/shared';

const router = (userController: UserController, userProfileController: UserProfileController, authMiddleware: AuthMiddleware) => {
  const apiRouter = express.Router();
  apiRouter.use(CreateRateLimiter());

  apiRouter.use('/users', userRoutes(userController, authMiddleware));
  apiRouter.use('/profiles', userProfileRoutes(userProfileController, authMiddleware));

  return apiRouter;
};

export default router;
