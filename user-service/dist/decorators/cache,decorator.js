"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = Cache;
const redis_service_1 = require("../services/redis/redis.service");
function Cache(ttl = 3600) {
    return function (_target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            const key = `${propertyKey}:${JSON.stringify(args)}`;
            const cachedResult = await redis_service_1.redisService.get(key);
            if (cachedResult) {
                return JSON.parse(cachedResult);
            }
            const result = await originalMethod.apply(this, args);
            await redis_service_1.redisService.set(key, JSON.stringify(result), ttl);
            return result;
        };
        return descriptor;
    };
}
