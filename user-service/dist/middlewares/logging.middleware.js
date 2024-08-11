"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../utils/logger"));
const requestLogger = (req, _res, next) => {
    logger_1.default.info(`${req.method} ${req.url}`, {
        body: req.body,
        params: req.params,
        query: req.query,
        ip: req.ip
    });
    next();
};
exports.default = requestLogger;
