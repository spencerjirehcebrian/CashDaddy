"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
const error_types_js_1 = require("../types/error.types.js");
const response_js_1 = require("../utils/response.js");
const logger_js_1 = require("../utils/logger.js");
const ErrorHandler = (err, _req, res, _next) => {
    if (err.stack) {
        logger_js_1.CustomLogger.error(err.stack);
    }
    else {
        logger_js_1.CustomLogger.error("Error stack is undefined");
    }
    if (err instanceof error_types_js_1.CustomError) {
        const serializedError = err.serializeErrors();
        return (0, response_js_1.sendResponse)(res, serializedError.statusCode, false, "An error occurred", serializedError);
    }
    // Mongoose validation error
    if (err.name === "ValidationError" &&
        "errors" in err &&
        err.errors !== undefined) {
        const errors = Object.values(err.errors).map((error) => error.message);
        const customError = new error_types_js_1.BadRequestError(errors.join(", "));
        const serializedError = customError.serializeErrors();
        return (0, response_js_1.sendResponse)(res, serializedError.statusCode, false, "Validation error", serializedError);
    }
    // Mongoose duplicate key error
    if ("code" in err &&
        err.code === 11000 &&
        "keyValue" in err &&
        err.keyValue !== undefined) {
        const field = Object.keys(err.keyValue)[0];
        const customError = new error_types_js_1.BadRequestError(`${field} already exists.`);
        const serializedError = customError.serializeErrors();
        return (0, response_js_1.sendResponse)(res, serializedError.statusCode, false, "Duplicate key error", serializedError);
    }
    // JWT authentication error
    if (err.name === "UnauthorizedError") {
        const customError = new error_types_js_1.NotAuthorizedError("Invalid token");
        const serializedError = customError.serializeErrors();
        return (0, response_js_1.sendResponse)(res, serializedError.statusCode, false, "Authentication error", serializedError);
    }
    if (err.name === "CastError" && "kind" in err && err.kind === "ObjectId") {
        const customError = new error_types_js_1.InvalidObjectIdError("Invalid ObjectId format: A param is not a valid");
        const serializedError = customError.serializeErrors();
        return (0, response_js_1.sendResponse)(res, serializedError.statusCode, false, "Invalid ObjectId", serializedError);
    }
    // Default to 500 server error
    const serverError = new error_types_js_1.ServerError("Internal Server Error");
    const serializedError = serverError.serializeErrors();
    return (0, response_js_1.sendResponse)(res, serializedError.statusCode, false, "Server error", serializedError);
};
exports.ErrorHandler = ErrorHandler;
