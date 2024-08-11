"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rbacMiddleware = void 0;
const error_types_1 = require("../types/error.types");
const rbacMiddleware = (roles) => {
    return (req, _res, next) => {
        const user = req.user;
        if (!user) {
            return next(new error_types_1.NotAuthorizedError('Not authorized'));
        }
        if (!roles.includes(user.role)) {
            return next(new error_types_1.NotAuthorizedError('Not authorized to access this resource'));
        }
        next();
    };
};
exports.rbacMiddleware = rbacMiddleware;
