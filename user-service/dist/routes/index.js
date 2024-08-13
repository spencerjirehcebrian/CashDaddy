"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_routes_1 = __importDefault(require("./user.routes"));
const user_profile_routes_1 = __importDefault(require("./user-profile.routes"));
const kyc_routes_1 = __importDefault(require("./kyc.routes"));
const rate_limit_middleware_1 = require("../middlewares/rate-limit.middleware");
const router = (userController, userProfileController, kycController) => {
    const apiRouter = express_1.default.Router();
    apiRouter.use((0, rate_limit_middleware_1.createRateLimiter)());
    apiRouter.use('/users', (0, user_routes_1.default)(userController));
    apiRouter.use('/profiles', (0, user_profile_routes_1.default)(userProfileController));
    apiRouter.use('/kyc', (0, kyc_routes_1.default)(kycController));
    return apiRouter;
};
exports.default = router;
