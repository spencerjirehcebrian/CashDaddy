"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
const redis_1 = require("redis");
const logger_js_1 = __importDefault(require("./logger.js"));
const index_js_1 = require("../config/index.js");
exports.redisClient = (0, redis_1.createClient)({
    url: index_js_1.config.REDIS_URL,
});
exports.redisClient.on("error", (err) => logger_js_1.default.error("Redis Client Error", err));
exports.redisClient.on("connect", () => logger_js_1.default.info("Connected to Redis:", index_js_1.config.REDIS_URL));
