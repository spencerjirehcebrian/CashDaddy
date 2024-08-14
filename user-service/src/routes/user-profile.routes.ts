import express from 'express';
import { createProfileSchema, updateProfileSchema } from '../validators/user-profile.validators';
import { requireAuth, requireAdmin, requireOwnership } from '../middlewares/auth.middleware';
import { UserProfileController } from '../controller/user-profile.controller';
import { zodValidation } from '../middlewares/validation.middleware';

const router = (userProfileController: UserProfileController) => {
  const profileRouter = express.Router();

  // Routes for user's own profile
  profileRouter.post(
    '/',
    requireOwnership,
    zodValidation(createProfileSchema),
    userProfileController.createProfile.bind(userProfileController)
  );

  profileRouter.get('/me', requireAuth, userProfileController.getOwnProfile.bind(userProfileController));

  profileRouter.put(
    '/me',
    requireAuth,
    zodValidation(updateProfileSchema),
    userProfileController.updateOwnProfile.bind(userProfileController)
  );

  // Admin routes
  profileRouter.get('/:userId', requireAdmin, userProfileController.getProfile.bind(userProfileController));

  profileRouter.put(
    '/:userId',
    requireAdmin,
    zodValidation(updateProfileSchema),
    userProfileController.updateProfile.bind(userProfileController)
  );

  return profileRouter;
};

export default router;
