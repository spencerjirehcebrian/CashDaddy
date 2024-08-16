"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validation_middleware_1 = require("../middlewares/validation.middleware");
const user_profile_validators_1 = require("../validators/user-profile.validators");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const user_profile_controller_1 = require("../controller/user-profile.controller");
const router = express_1.default.Router();
// Routes for user's own profile
router.post('/', auth_middleware_1.requireOwnership, (0, validation_middleware_1.joiValidation)(user_profile_validators_1.createProfileSchema), user_profile_controller_1.UserProfileController.createProfile);
router.get('/me', auth_middleware_1.requireAuth, user_profile_controller_1.UserProfileController.getOwnProfile);
router.put('/me', auth_middleware_1.requireAuth, (0, validation_middleware_1.joiValidation)(user_profile_validators_1.updateProfileSchema), user_profile_controller_1.UserProfileController.updateOwnProfile);
// Admin routes
router.get('/:userId', auth_middleware_1.requireAdmin, user_profile_controller_1.UserProfileController.getProfile);
router.put('/:userId', auth_middleware_1.requireAdmin, (0, validation_middleware_1.joiValidation)(user_profile_validators_1.updateProfileSchema), user_profile_controller_1.UserProfileController.updateProfile);
exports.default = router;
