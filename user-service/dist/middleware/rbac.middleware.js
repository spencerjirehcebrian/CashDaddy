"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rbacMiddleware = void 0;
const error_types_1 = require("../types/error.types");
const rbacMiddleware = (roles) => {
    return (req, _res, next) => {
        if (!req.currentUser) {
            throw new error_types_1.NotAuthorizedError('Not authorized');
        }
        if (!roles.includes(req.currentUser.role)) {
            throw new error_types_1.NotAuthorizedError('Not authorized to access this resource');
        }
        next();
    };
};
exports.rbacMiddleware = rbacMiddleware;
