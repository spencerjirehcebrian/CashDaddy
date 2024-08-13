"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = require("body-parser");
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const user_service_1 = require("./services/db/user.service");
const auth_service_1 = require("./services/auth/auth.service");
const user_profile_service_1 = require("./services/db/user-profile.service");
const redis_service_1 = require("./services/redis/redis.service");
const caching_decorator_1 = require("./decorators/caching.decorator");
const routes_1 = __importDefault(require("./routes"));
const error_middleware_1 = __importDefault(require("./middlewares/error.middleware"));
const cache_manager_service_1 = require("./services/cache/cache-manager.service");
const user_controller_1 = require("./controller/user.controller");
const user_profile_controller_1 = require("./controller/user-profile.controller");
const kyc_service_1 = require("./services/db/kyc.service");
const kyc_controller_1 = require("./controller/kyc.controller");
const app = (0, express_1.default)();
app.use((0, body_parser_1.json)());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
const corsOptions = {
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};
app.use((0, cors_1.default)(corsOptions));
const redisService = new redis_service_1.RedisService();
const cacheManager = new cache_manager_service_1.CacheManager(redisService);
(0, caching_decorator_1.setCacheManager)(cacheManager);
// Create instances of services
const userService = new user_service_1.UserService();
const authService = new auth_service_1.AuthService();
const userProfileService = new user_profile_service_1.UserProfileService();
const kycService = new kyc_service_1.KYCService();
// Create instances of controllers with injected dependencies
const userController = new user_controller_1.UserController(userService, authService);
const userProfileController = new user_profile_controller_1.UserProfileController(userProfileService);
const kycController = new kyc_controller_1.KYCController(kycService);
// Set up routes
app.use('/api', (0, routes_1.default)(userController, userProfileController, kycController));
app.use(error_middleware_1.default);
exports.default = app;
