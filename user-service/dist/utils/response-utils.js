"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
const logger_1 = __importDefault(require("./logger"));
const sendResponse = (res, statusCode, success, message, data) => {
    const response = {
        success,
        message,
        data
    };
    // Remove quotes from error messages in the data object
    if (data && typeof data === 'object' && 'message' in data) {
        data.message = data.message.replace(/^"(.+)"$/, '$1');
        logger_1.default.info(data.message);
    }
    logger_1.default.info(`Response: ${statusCode} ${message}`, { response });
    return res.status(statusCode).json(response);
};
exports.sendResponse = sendResponse;
