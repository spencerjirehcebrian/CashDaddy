"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CustomErrors_1 = require("../utils/CustomErrors");
const logger_1 = __importDefault(require("../utils/logger"));
const errorHandler = (err, _req, res, _next) => {
    logger_1.default.error(err.stack);
    if (err instanceof CustomErrors_1.CustomError) {
        const serializedError = err.serializeErrors();
        return res.status(serializedError.statusCode).json({ error: serializedError.message });
    }
    // Mongoose validation error
    if (err.name === 'ValidationError' && 'errors' in err && err.errors !== undefined) {
        const errors = Object.values(err.errors).map((error) => error.message);
        const customError = new CustomErrors_1.BadRequestError(errors.join(', '));
        const serializedError = customError.serializeErrors();
        return res.status(serializedError.statusCode).json({ error: serializedError.message });
    }
    // Mongoose duplicate key error
    if ('code' in err && err.code === 11000 && 'keyValue' in err && err.keyValue !== undefined) {
        const field = Object.keys(err.keyValue)[0];
        const customError = new CustomErrors_1.BadRequestError(`${field} already exists.`);
        const serializedError = customError.serializeErrors();
        return res.status(serializedError.statusCode).json({ error: serializedError.message });
    }
    // JWT authentication error
    if (err.name === 'UnauthorizedError') {
        const customError = new CustomErrors_1.NotAuthorizedError('Invalid token');
        const serializedError = customError.serializeErrors();
        return res.status(serializedError.statusCode).json({ error: serializedError.message });
    }
    // Default to 500 server error
    const serverError = new CustomErrors_1.ServerError('Internal Server Error');
    const serializedError = serverError.serializeErrors();
    res.status(serializedError.statusCode).json({ error: serializedError.message });
};
exports.default = errorHandler;
