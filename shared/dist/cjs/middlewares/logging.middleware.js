"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestLogger = void 0;
const logger_js_1 = __importDefault(require("../utils/logger.js"));
const RequestLogger = (req, _res, next) => {
    logger_js_1.default.info(`${req.method} ${req.url}`, {
        body: req.body,
        params: req.params,
        query: req.query,
        ip: req.ip,
    });
    next();
};
exports.RequestLogger = RequestLogger;
