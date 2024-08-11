import express from 'express';
import { joiValidation } from '../middlewares/validation.middleware';
import { createProfileSchema, updateProfileSchema } from '../validators/user-profile.validators';
import { requireAuth, requireAdmin, requireOwnership } from '../middlewares/auth.middleware';
import { UserProfileController } from '../controller/user-profile.controller';

const router = express.Router();

// Routes for user's own profile
router.post('/', requireOwnership, joiValidation(createProfileSchema), UserProfileController.createProfile);

router.get('/me', requireAuth, UserProfileController.getOwnProfile);

router.put('/me', requireAuth, joiValidation(updateProfileSchema), UserProfileController.updateOwnProfile);

// Admin routes
router.get('/:userId', requireAdmin, UserProfileController.getProfile);

router.put('/:userId', requireAdmin, joiValidation(updateProfileSchema), UserProfileController.updateProfile);

export default router;
