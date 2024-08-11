"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisService = void 0;
const redis_client_1 = require("../../utils/redis-client");
class RedisService {
    async set(key, value, expiration) {
        await redis_client_1.redisClient.set(key, value);
        if (expiration) {
            await redis_client_1.redisClient.expire(key, expiration);
        }
    }
    async get(key) {
        return await redis_client_1.redisClient.get(key);
    }
    async del(key) {
        await redis_client_1.redisClient.del(key);
    }
    async setex(key, seconds, value) {
        await redis_client_1.redisClient.setEx(key, seconds, value);
    }
    async hset(key, field, value) {
        await redis_client_1.redisClient.hSet(key, field, value);
    }
    async hget(key, field) {
        return await redis_client_1.redisClient.hGet(key, field);
    }
    async hgetall(key) {
        return await redis_client_1.redisClient.hGetAll(key);
    }
    async hdel(key, field) {
        await redis_client_1.redisClient.hDel(key, field);
    }
    async hsetex(key, seconds, fields) {
        await redis_client_1.redisClient.hSet(key, fields);
        await redis_client_1.redisClient.expire(key, seconds);
    }
    async keys(pattern) {
        return await redis_client_1.redisClient.keys(pattern);
    }
}
exports.redisService = new RedisService();
