"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestLogger = void 0;
const logger_1 = require("../utils/logger");
const RequestLogger = (req, _res, next) => {
    logger_1.CustomLogger.info(`${req.method} ${req.url}`, {
        body: req.body,
        params: req.params,
        query: req.query,
        ip: req.ip,
    });
    next();
};
exports.RequestLogger = RequestLogger;
