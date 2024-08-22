"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
const redis_1 = require("redis");
const index_js_1 = require("../config/index.js");
const logger_js_1 = require("./logger.js");
exports.redisClient = (0, redis_1.createClient)({
    url: index_js_1.config.REDIS_URL,
});
exports.redisClient.on("error", (err) => logger_js_1.CustomLogger.error("Redis Client Error", err));
exports.redisClient.on("connect", () => logger_js_1.CustomLogger.info("Connected to Redis:", index_js_1.config.REDIS_URL));
