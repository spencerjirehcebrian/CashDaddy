"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const error_types_1 = require("../types/error.types");
const authMiddleware = (req, _res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new error_types_1.NotAuthorizedError('No token provided');
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.currentUser = decoded;
        next();
    }
    catch (error) {
        const e = error;
        throw new error_types_1.NotAuthorizedError('Invalid token: ' + e.message);
    }
};
exports.authMiddleware = authMiddleware;
