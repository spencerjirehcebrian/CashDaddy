import express from 'express';
import { joiValidation } from '../middlewares/validation.middleware';
import { loginSchema, registerSchema, updateUserSchema } from '../validators/user.validators';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { UserController } from '../controller/user.controller';

const router = express.Router();

// Public routes
router.post('/register', joiValidation(registerSchema), UserController.register);
router.post('/login', joiValidation(loginSchema), UserController.login);
router.post('/logout', requireAuth, UserController.logout);

// Authenticated user routes
router.get('/me', requireAuth, UserController.getOwnUser);
router.put('/me', requireAuth, joiValidation(updateUserSchema), UserController.updateOwnUser);

// Admin routes
router.get('/all', requireAdmin, UserController.getAllUsers);
router.get('/:userId', requireAdmin, UserController.getUser);
router.put('/:userId', requireAdmin, joiValidation(updateUserSchema), UserController.updateUser);
router.post('/:userId/deactivate', requireAdmin, UserController.deactivateUser);
router.post('/:userId/reactivate', requireAdmin, UserController.reactivateUser);

export default router;
