"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
const sendResponse = (res, statusCode, success, message, data, error) => {
    const response = {
        success,
        message,
        data,
        error
    };
    return res.status(statusCode).json(response);
};
exports.sendResponse = sendResponse;
