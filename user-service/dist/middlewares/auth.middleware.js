"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireOwnership = exports.requireAdmin = exports.requireAuth = exports.authMiddleware = void 0;
const error_types_1 = require("../types/error.types");
const session_service_1 = require("../services/session/session.service");
const user_interface_1 = require("../interfaces/user.interface");
const logger_1 = __importDefault(require("../utils/logger"));
const authMiddleware = (options = {}) => {
    const { roles, checkOwnership = false, ownershipParamName = 'userId' } = options;
    return async (req, _res, next) => {
        try {
            const sessionId = req.cookies['sessionId'];
            if (!sessionId) {
                throw new error_types_1.NotAuthorizedError('Authentication required');
            }
            const authPayload = await session_service_1.sessionService.getAuthPayload(sessionId);
            if (!authPayload) {
                throw new error_types_1.NotAuthorizedError('Invalid session');
            }
            // Check roles if specified
            if (roles) {
                const hasRequiredRole = Array.isArray(roles) ? roles.includes(authPayload.role) : roles(authPayload.role);
                if (!hasRequiredRole) {
                    throw new error_types_1.NotAuthorizedError('Insufficient privileges');
                }
            }
            // Attach the authPayload to the request
            req.user = authPayload;
            // Check ownership if required
            if (checkOwnership && authPayload.role !== user_interface_1.UserRole.ADMIN) {
                const resourceUserId = getResourceUserId(req, ownershipParamName);
                logger_1.default.info(ownershipParamName + ' ' + req);
                logger_1.default.info(`Ownership check: ${authPayload.userId} ${resourceUserId}`);
                if (authPayload.userId !== resourceUserId) {
                    throw new error_types_1.NotAuthorizedError('Not authorized to access this resource ' + resourceUserId + ' ' + authPayload.userId);
                }
            }
            // Refresh the session
            await session_service_1.sessionService.refreshSession(sessionId);
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
