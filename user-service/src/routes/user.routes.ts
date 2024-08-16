import express from 'express';
import { loginSchema, registerSchema, updateUserSchema } from '../validators/user.validators';
import { requireAuth, requireAdmin, requireSuperAdmin } from '../middlewares/auth.middleware';
import { UserController } from '../controller/user.controller';
import { zodValidation } from '../middlewares/validation.middleware';

const router = (userController: UserController) => {
  const userRouter = express.Router();

  // Public routes
  userRouter.post('/register', zodValidation(registerSchema), userController.register.bind(userController));
  userRouter.post('/login', zodValidation(loginSchema), userController.login.bind(userController));
  userRouter.post('/logout', requireAuth, userController.logout.bind(userController));

  // Authenticated user routes
  userRouter.get('/me', requireAuth, userController.getOwnUser.bind(userController));
  userRouter.put('/me', requireAuth, zodValidation(updateUserSchema), userController.updateOwnUser.bind(userController));

  // Admin routes
  userRouter.get('/all', requireAdmin, userController.getAllUsers.bind(userController));
  userRouter.get('/:userId', requireAdmin, userController.getUser.bind(userController));
  userRouter.put('/:userId', requireAdmin, zodValidation(updateUserSchema), userController.updateUser.bind(userController));
  userRouter.post('/:userId/deactivate', requireAdmin, userController.deactivateUser.bind(userController));
  userRouter.post('/:userId/reactivate', requireAdmin, userController.reactivateUser.bind(userController));

  //SuperAdmin routes
  userRouter.post('/:userId/promote', requireSuperAdmin, userController.promoteUserToAdmin.bind(userController));

  return userRouter;
};

export default router;
