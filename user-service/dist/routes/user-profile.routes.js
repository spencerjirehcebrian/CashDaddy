"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validation_middleware_1 = require("../middlewares/validation.middleware");
const user_profile_validators_1 = require("../validators/user-profile.validators");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (userProfileController) => {
    const profileRouter = express_1.default.Router();
    // Routes for user's own profile
    profileRouter.post('/', auth_middleware_1.requireOwnership, (0, validation_middleware_1.joiValidation)(user_profile_validators_1.createProfileSchema), userProfileController.createProfile.bind(userProfileController));
    profileRouter.get('/me', auth_middleware_1.requireAuth, userProfileController.getOwnProfile.bind(userProfileController));
    profileRouter.put('/me', auth_middleware_1.requireAuth, (0, validation_middleware_1.joiValidation)(user_profile_validators_1.updateProfileSchema), userProfileController.updateOwnProfile.bind(userProfileController));
    // Admin routes
    profileRouter.get('/:userId', auth_middleware_1.requireAdmin, userProfileController.getProfile.bind(userProfileController));
    profileRouter.put('/:userId', auth_middleware_1.requireAdmin, (0, validation_middleware_1.joiValidation)(user_profile_validators_1.updateProfileSchema), userProfileController.updateProfile.bind(userProfileController));
    return profileRouter;
};
exports.default = router;
