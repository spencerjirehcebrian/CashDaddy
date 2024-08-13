"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validation_middleware_1 = require("../middlewares/validation.middleware");
const user_validators_1 = require("../validators/user.validators");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (userController) => {
    const userRouter = express_1.default.Router();
    // Public routes
    userRouter.post('/register', (0, validation_middleware_1.joiValidation)(user_validators_1.registerSchema), userController.register.bind(userController));
    userRouter.post('/login', (0, validation_middleware_1.joiValidation)(user_validators_1.loginSchema), userController.login.bind(userController));
    userRouter.post('/logout', auth_middleware_1.requireAuth, userController.logout.bind(userController));
    // Authenticated user routes
    userRouter.get('/me', auth_middleware_1.requireAuth, userController.getOwnUser.bind(userController));
    userRouter.put('/me', auth_middleware_1.requireAuth, (0, validation_middleware_1.joiValidation)(user_validators_1.updateUserSchema), userController.updateOwnUser.bind(userController));
    // Admin routes
    userRouter.get('/all', auth_middleware_1.requireAdmin, userController.getAllUsers.bind(userController));
    userRouter.get('/:userId', auth_middleware_1.requireAdmin, userController.getUser.bind(userController));
    userRouter.put('/:userId', auth_middleware_1.requireAdmin, (0, validation_middleware_1.joiValidation)(user_validators_1.updateUserSchema), userController.updateUser.bind(userController));
    userRouter.post('/:userId/deactivate', auth_middleware_1.requireAdmin, userController.deactivateUser.bind(userController));
    userRouter.post('/:userId/reactivate', auth_middleware_1.requireAdmin, userController.reactivateUser.bind(userController));
    return userRouter;
};
exports.default = router;
