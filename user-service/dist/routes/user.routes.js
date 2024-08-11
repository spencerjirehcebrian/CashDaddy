"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validation_middleware_1 = require("../middlewares/validation.middleware");
const user_validators_1 = require("../validators/user.validators");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const user_controller_1 = require("../controller/user.controller");
const router = express_1.default.Router();
// Public routes
router.post('/register', (0, validation_middleware_1.joiValidation)(user_validators_1.registerSchema), user_controller_1.UserController.register);
router.post('/login', (0, validation_middleware_1.joiValidation)(user_validators_1.loginSchema), user_controller_1.UserController.login);
router.post('/logout', auth_middleware_1.requireAuth, user_controller_1.UserController.logout);
// Authenticated user routes
router.get('/me', auth_middleware_1.requireAuth, user_controller_1.UserController.getOwnUser);
router.put('/me', auth_middleware_1.requireAuth, (0, validation_middleware_1.joiValidation)(user_validators_1.updateUserSchema), user_controller_1.UserController.updateOwnUser);
// Admin routes
router.get('/all', auth_middleware_1.requireAdmin, user_controller_1.UserController.getAllUsers);
router.get('/:userId', auth_middleware_1.requireAdmin, user_controller_1.UserController.getUser);
router.put('/:userId', auth_middleware_1.requireAdmin, (0, validation_middleware_1.joiValidation)(user_validators_1.updateUserSchema), user_controller_1.UserController.updateUser);
router.post('/:userId/deactivate', auth_middleware_1.requireAdmin, user_controller_1.UserController.deactivateUser);
router.post('/:userId/reactivate', auth_middleware_1.requireAdmin, user_controller_1.UserController.reactivateUser);
exports.default = router;
