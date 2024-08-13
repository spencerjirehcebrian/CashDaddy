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
    logger_1.default.info(`Response: ${statusCode} ${message}`);
    return res.status(statusCode).json(response);
};
exports.sendResponse = sendResponse;
