import express from 'express';
import { createProfileSchema, updateProfileSchema } from '../validators/user-profile.validators';
import { UserProfileController } from '../controller/user-profile.controller';
import { zodValidation } from '../middlewares/validation.middleware';
import { AuthMiddleware } from '../middlewares/auth.middleware';

const router = (userProfileController: UserProfileController, authMiddleware: AuthMiddleware) => {
  const profileRouter = express.Router();

  // Routes for user's own profile
  profileRouter.post(
    '/',
    authMiddleware.requireOwnership,
    zodValidation(createProfileSchema),
    userProfileController.createProfile.bind(userProfileController)
  );

  profileRouter.get('/me', authMiddleware.requireAuth, userProfileController.getOwnProfile.bind(userProfileController));

  profileRouter.put(
    '/me',
    authMiddleware.requireAuth,
    zodValidation(updateProfileSchema),
    userProfileController.updateOwnProfile.bind(userProfileController)
  );

  // Admin routes
  profileRouter.get('/:userId', authMiddleware.requireAdmin, userProfileController.getProfile.bind(userProfileController));

  profileRouter.put(
    '/:userId',
    authMiddleware.requireAdmin,
    zodValidation(updateProfileSchema),
    userProfileController.updateProfile.bind(userProfileController)
  );

  return profileRouter;
};

export default router;
