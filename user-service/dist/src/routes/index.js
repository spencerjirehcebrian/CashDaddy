import express from 'express';
import userRoutes from './user.routes.js';
import userProfileRoutes from './user-profile.routes.js';
import { CreateRateLimiter } from '@cash-daddy/shared';
const router = (userController, userProfileController, authMiddleware) => {
    const apiRouter = express.Router();
    apiRouter.use(CreateRateLimiter());
    apiRouter.use('/users', userRoutes(userController, authMiddleware));
    apiRouter.use('/profiles', userProfileRoutes(userProfileController, authMiddleware));
    return apiRouter;
};
export default router;
