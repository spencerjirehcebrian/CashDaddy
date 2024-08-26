"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
const logger_1 = require("./logger");
const sendResponse = (res, statusCode, success, message, data) => {
    const response = {
        success,
        message,
        data,
    };
    logger_1.CustomLogger.info(`Response: ${statusCode} ${message}`);
    return res.status(statusCode).json(response);
};
exports.sendResponse = sendResponse;
