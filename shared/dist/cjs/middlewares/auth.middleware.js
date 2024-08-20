"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const user_interface_js_1 = require("../interfaces/models/user.interface.js");
const error_types_js_1 = require("../types/error.types.js");
class AuthMiddleware {
    constructor(authService, redisService) {
        this.authService = authService;
        this.redisService = redisService;
        this.requireAuth = this.createMiddleware();
        this.requireAdmin = this.createMiddleware({
            roles: [user_interface_js_1.UserRole.ADMIN, user_interface_js_1.UserRole.SUPER_ADMIN],
        });
        this.requireSuperAdmin = this.createMiddleware({
            roles: [user_interface_js_1.UserRole.SUPER_ADMIN],
        });
        this.requireOwnership = this.createMiddleware({ checkOwnership: true });
    }
    createMiddleware(options = {}) {
        const { roles, checkOwnership = false, ownershipParamName = "userId", } = options;
        return (req, _res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
                if (!token) {
                    throw new error_types_js_1.NotAuthorizedError("Authentication required");
                }
                const decoded = this.authService.verifyToken(token);
                // Check if token is blacklisted
                const isBlacklisted = yield this.redisService.isBlacklisted(token);
                if (isBlacklisted) {
                    throw new error_types_js_1.NotAuthorizedError("User is logged out");
                }
                // Check roles if specified
                if (roles) {
                    const hasRequiredRole = Array.isArray(roles)
                        ? roles.includes(decoded.role) ||
                            decoded.role === user_interface_js_1.UserRole.SUPER_ADMIN
                        : roles(decoded.role) || decoded.role === user_interface_js_1.UserRole.SUPER_ADMIN;
                    if (!hasRequiredRole) {
                        throw new error_types_js_1.NotAuthorizedError("Insufficient privileges");
                    }
                }
                // Attach the decoded payload to the request
                req.user = decoded;
                // Check ownership if required
                if (checkOwnership &&
                    decoded.role !== user_interface_js_1.UserRole.ADMIN &&
                    decoded.role !== user_interface_js_1.UserRole.SUPER_ADMIN) {
                    const resourceUserId = this.getResourceUserId(req, ownershipParamName);
                    if (decoded.userId !== resourceUserId) {
                        throw new error_types_js_1.NotAuthorizedError("Not authorized to access this resource");
                    }
                }
                next();
            }
            catch (error) {
                next(error);
            }
        });
    }
    getResourceUserId(req, paramName) {
        return req.params[paramName] || req.user.userId;
    }
}
exports.AuthMiddleware = AuthMiddleware;
