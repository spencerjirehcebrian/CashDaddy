"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
const redis_1 = require("redis");
const config_1 = require("../config");
const logger_1 = __importDefault(require("./logger"));
exports.redisClient = (0, redis_1.createClient)({
    url: config_1.config.REDIS_URL
});
exports.redisClient.on('error', (err) => logger_1.default.error('Redis Client Error', err));
exports.redisClient.on('connect', () => logger_1.default.info('Connected to Redis:', config_1.config.REDIS_URL));
