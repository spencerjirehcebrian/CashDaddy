import express from 'express';
import { createProfileSchema, updateProfileSchema } from '../validators/user-profile.validators.js';
import { UserProfileController } from '../controller/user-profile.controller.js';
import { AuthMiddleware, ZodValidation } from '@cash-daddy/shared';

const router = (userProfileController: UserProfileController, authMiddleware: AuthMiddleware) => {
  const profileRouter = express.Router();

  // Routes for user's own profile
  profileRouter.post(
    '/',
    authMiddleware.requireOwnership,
    ZodValidation(createProfileSchema),
    userProfileController.createProfile.bind(userProfileController)
  );

  profileRouter.get('/me', authMiddleware.requireAuth, userProfileController.getOwnProfile.bind(userProfileController));

  profileRouter.put(
    '/me',
    authMiddleware.requireAuth,
    ZodValidation(updateProfileSchema),
    userProfileController.updateOwnProfile.bind(userProfileController)
  );

  // Admin routes
  profileRouter.get('/:userId', authMiddleware.requireAdmin, userProfileController.getProfile.bind(userProfileController));

  profileRouter.put(
    '/:userId',
    authMiddleware.requireAdmin,
    ZodValidation(updateProfileSchema),
    userProfileController.updateProfile.bind(userProfileController)
  );

  return profileRouter;
};

export default router;
