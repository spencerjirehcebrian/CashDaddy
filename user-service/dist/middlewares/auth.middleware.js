"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireOwnership = exports.requireAdmin = exports.requireAuth = exports.authMiddleware = void 0;
const error_types_1 = require("../types/error.types");
const user_interface_1 = require("../interfaces/models/user.interface");
const logger_1 = __importDefault(require("../utils/logger"));
const auth_service_1 = require("../services/auth/auth.service");
const authService = new auth_service_1.AuthService();
const authMiddleware = (options = {}) => {
    const { roles, checkOwnership = false, ownershipParamName = 'userId' } = options;
    return async (req, _res, next) => {
        try {
            const token = req.header('Authorization')?.replace('Bearer ', '');
            if (!token) {
                throw new error_types_1.NotAuthorizedError('Authentication required');
            }
            const decoded = authService.verifyToken(token);
            // Check roles if specified
            if (roles) {
                const hasRequiredRole = Array.isArray(roles) ? roles.includes(decoded.role) : roles(decoded.role);
                if (!hasRequiredRole) {
                    throw new error_types_1.NotAuthorizedError('Insufficient privileges');
                }
            }
            // Attach the decoded payload to the request
            req.user = decoded;
            // Check ownership if required
            if (checkOwnership && decoded.role !== user_interface_1.UserRole.ADMIN) {
                const resourceUserId = getResourceUserId(req, ownershipParamName);
                logger_1.default.info(`Ownership check: ${decoded.userId} ${resourceUserId}`);
                if (decoded.userId !== resourceUserId) {
                    throw new error_types_1.NotAuthorizedError('Not authorized to access this resource');
                }
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.authMiddleware = authMiddleware;
function getResourceUserId(req, paramName) {
    return req.params[paramName] || req.user.userId;
}
// Helper functions for common auth scenarios
exports.requireAuth = (0, exports.authMiddleware)();
exports.requireAdmin = (0, exports.authMiddleware)({ roles: [user_interface_1.UserRole.ADMIN] });
exports.requireOwnership = (0, exports.authMiddleware)({ checkOwnership: true });
