"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ownershipMiddleware = void 0;
const error_types_1 = require("../types/error.types");
const session_service_1 = require("../services/session/session.service");
const ownershipMiddleware = (paramName = 'userId') => {
    return async (req, _res, next) => {
        const sessionId = req.cookies['sessionId'];
        if (!sessionId) {
            return next(new error_types_1.NotAuthorizedError('Not authorized - session not found'));
        }
        const authPayload = await session_service_1.sessionService.getAuthPayload(sessionId);
        if (!authPayload) {
            return next(new error_types_1.NotAuthorizedError('Not authorized - auth payload not found'));
        }
        // Allow access if the user is an admin
        if (authPayload.role === 'admin') {
            req.user = authPayload;
            return next();
        }
        let resourceUserId;
        if (req.method === 'POST') {
            // For POST requests, check the userId in the request body
            resourceUserId = req.body.userId;
        }
        else {
            // For other requests, check the userId in the route parameters
            resourceUserId = req.params[paramName];
        }
        // If no resourceUserId is found, assume the user is trying to access their own resource
        if (!resourceUserId) {
            resourceUserId = authPayload.userId;
        }
        // Check if the resource belongs to the user
        if (authPayload.userId !== resourceUserId) {
            return next(new error_types_1.NotAuthorizedError('Not authorized to access this resource'));
        }
        // Attach the authPayload to the request for use in subsequent middleware or route handlers
        req.user = authPayload;
        next();
    };
};
exports.ownershipMiddleware = ownershipMiddleware;
