"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_routes_1 = __importDefault(require("./user.routes"));
const user_profile_routes_1 = __importDefault(require("./user-profile.routes"));
const kyc_routes_1 = __importDefault(require("./kyc.routes"));
const payment_method_routes_1 = __importDefault(require("./payment-method.routes"));
const rate_limit_middleware_1 = require("../middlewares/rate-limit.middleware");
const router = express_1.default.Router();
router.use((0, rate_limit_middleware_1.createRateLimiter)());
router.use('/users', user_routes_1.default);
router.use('/profiles', user_profile_routes_1.default);
router.use('/kyc', kyc_routes_1.default);
router.use('/payment-methods', payment_method_routes_1.default);
exports.default = router;
