import { redisClient } from "../../utils/redis-client";
const BLACKLIST_KEY = "token_blacklist";
const BLACKLIST_TTL = 24 * 60 * 60; // 24 hours in seconds
export class RedisService {
    async set(key, value, expiration) {
        await redisClient.set(key, value);
        if (expiration) {
            await redisClient.expire(key, expiration);
        }
    }
    async get(key) {
        return await redisClient.get(key);
    }
    async del(key) {
        await redisClient.del(key);
    }
    async setex(key, seconds, value) {
        await redisClient.setEx(key, seconds, value);
    }
    async hset(key, field, value) {
        await redisClient.hSet(key, field, value);
    }
    async hget(key, field) {
        return await redisClient.hGet(key, field);
    }
    async hgetall(key) {
        return await redisClient.hGetAll(key);
    }
    async hdel(key, field) {
        await redisClient.hDel(key, field);
    }
    async hsetex(key, seconds, fields) {
        await redisClient.hSet(key, fields);
        await redisClient.expire(key, seconds);
    }
    async keys(pattern) {
        return await redisClient.keys(pattern);
    }
    async addToBlacklist(token) {
        const multi = redisClient.multi();
        multi.sAdd(BLACKLIST_KEY, token);
        multi.expire(BLACKLIST_KEY, BLACKLIST_TTL);
        await multi.exec();
    }
    async isBlacklisted(token) {
        const result = await redisClient.sIsMember(BLACKLIST_KEY, token);
        return result;
    }
}
//# sourceMappingURL=redis.service.js.map