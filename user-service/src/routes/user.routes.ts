import express from 'express';
import { loginSchema, registerSchema, updateUserSchema } from '../validators/user.validators';
import { UserController } from '../controller/user.controller';
import { zodValidation } from '../middlewares/validation.middleware';
import { AuthMiddleware } from '../middlewares/auth.middleware';

const router = (userController: UserController, authMiddleware: AuthMiddleware) => {
  const userRouter = express.Router();

  // Public routes
  userRouter.post('/register', zodValidation(registerSchema), userController.register.bind(userController));
  userRouter.post('/login', zodValidation(loginSchema), userController.login.bind(userController));
  userRouter.post('/logout', authMiddleware.requireAuth, userController.logout.bind(userController));

  // Authenticated user routes
  userRouter.get('/me', authMiddleware.requireAuth, userController.getOwnUser.bind(userController));
  userRouter.put('/me', authMiddleware.requireAuth, zodValidation(updateUserSchema), userController.updateOwnUser.bind(userController));

  // Admin routes
  userRouter.get('/all', authMiddleware.requireAdmin, userController.getAllUsers.bind(userController));
  userRouter.get('/:userId', authMiddleware.requireAdmin, userController.getUser.bind(userController));
  userRouter.put('/:userId', authMiddleware.requireAdmin, zodValidation(updateUserSchema), userController.updateUser.bind(userController));
  userRouter.post('/:userId/deactivate', authMiddleware.requireAdmin, userController.deactivateUser.bind(userController));
  userRouter.post('/:userId/reactivate', authMiddleware.requireAdmin, userController.reactivateUser.bind(userController));

  //SuperAdmin routes
  userRouter.post('/:userId/promote', authMiddleware.requireSuperAdmin, userController.promoteUserToAdmin.bind(userController));

  return userRouter;
};

export default router;
