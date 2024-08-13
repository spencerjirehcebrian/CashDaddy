import express from 'express';
import { joiValidation } from '../middlewares/validation.middleware';
import { loginSchema, registerSchema, updateUserSchema } from '../validators/user.validators';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { UserController } from '../controller/user.controller';

const router = (userController: UserController) => {
  const userRouter = express.Router();

  // Public routes
  userRouter.post('/register', joiValidation(registerSchema), userController.register.bind(userController));
  userRouter.post('/login', joiValidation(loginSchema), userController.login.bind(userController));
  userRouter.post('/logout', requireAuth, userController.logout.bind(userController));

  // Authenticated user routes
  userRouter.get('/me', requireAuth, userController.getOwnUser.bind(userController));
  userRouter.put('/me', requireAuth, joiValidation(updateUserSchema), userController.updateOwnUser.bind(userController));

  // Admin routes
  userRouter.get('/all', requireAdmin, userController.getAllUsers.bind(userController));
  userRouter.get('/:userId', requireAdmin, userController.getUser.bind(userController));
  userRouter.put('/:userId', requireAdmin, joiValidation(updateUserSchema), userController.updateUser.bind(userController));
  userRouter.post('/:userId/deactivate', requireAdmin, userController.deactivateUser.bind(userController));
  userRouter.post('/:userId/reactivate', requireAdmin, userController.reactivateUser.bind(userController));

  return userRouter;
};

export default router;