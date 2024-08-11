"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_types_1 = require("../types/error.types");
const logger_1 = __importDefault(require("../utils/logger"));
const response_1 = require("../utils/response");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (err, _req, res, _next) => {
    logger_1.default.error(err.stack);
    if (err instanceof error_types_1.CustomError) {
        const serializedError = err.serializeErrors();
        return (0, response_1.sendResponse)(res, serializedError.statusCode, false, 'An error occurred', serializedError);
    }
    // Mongoose validation error
    if (err.name === 'ValidationError' && 'errors' in err && err.errors !== undefined) {
        const errors = Object.values(err.errors).map((error) => error.message);
        const customError = new error_types_1.BadRequestError(errors.join(', '));
        const serializedError = customError.serializeErrors();
        return (0, response_1.sendResponse)(res, serializedError.statusCode, false, 'Validation error', serializedError);
    }
    // Mongoose duplicate key error
    if ('code' in err && err.code === 11000 && 'keyValue' in err && err.keyValue !== undefined) {
        const field = Object.keys(err.keyValue)[0];
        const customError = new error_types_1.BadRequestError(`${field} already exists.`);
        const serializedError = customError.serializeErrors();
        return (0, response_1.sendResponse)(res, serializedError.statusCode, false, 'Duplicate key error', serializedError);
    }
    // JWT authentication error
    if (err.name === 'UnauthorizedError') {
        const customError = new error_types_1.NotAuthorizedError('Invalid token');
        const serializedError = customError.serializeErrors();
        return (0, response_1.sendResponse)(res, serializedError.statusCode, false, 'Authentication error', serializedError);
    }
    // Default to 500 server error
    const serverError = new error_types_1.ServerError('Internal Server Error');
    const serializedError = serverError.serializeErrors();
    return (0, response_1.sendResponse)(res, serializedError.statusCode, false, 'Server error', serializedError);
};
exports.default = errorHandler;
