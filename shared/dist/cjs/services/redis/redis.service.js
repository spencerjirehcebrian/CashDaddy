"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const redis_client_js_1 = require("../../utils/redis-client.js");
const BLACKLIST_KEY = "token_blacklist";
const BLACKLIST_TTL = 24 * 60 * 60; // 24 hours in seconds
class RedisService {
    set(key, value, expiration) {
        return __awaiter(this, void 0, void 0, function* () {
            yield redis_client_js_1.redisClient.set(key, value);
            if (expiration) {
                yield redis_client_js_1.redisClient.expire(key, expiration);
            }
        });
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield redis_client_js_1.redisClient.get(key);
        });
    }
    del(key) {
        return __awaiter(this, void 0, void 0, function* () {
            yield redis_client_js_1.redisClient.del(key);
        });
    }
    setex(key, seconds, value) {
        return __awaiter(this, void 0, void 0, function* () {
            yield redis_client_js_1.redisClient.setEx(key, seconds, value);
        });
    }
    hset(key, field, value) {
        return __awaiter(this, void 0, void 0, function* () {
            yield redis_client_js_1.redisClient.hSet(key, field, value);
        });
    }
    hget(key, field) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield redis_client_js_1.redisClient.hGet(key, field);
        });
    }
    hgetall(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield redis_client_js_1.redisClient.hGetAll(key);
        });
    }
    hdel(key, field) {
        return __awaiter(this, void 0, void 0, function* () {
            yield redis_client_js_1.redisClient.hDel(key, field);
        });
    }
    hsetex(key, seconds, fields) {
        return __awaiter(this, void 0, void 0, function* () {
            yield redis_client_js_1.redisClient.hSet(key, fields);
            yield redis_client_js_1.redisClient.expire(key, seconds);
        });
    }
    keys(pattern) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield redis_client_js_1.redisClient.keys(pattern);
        });
    }
    addToBlacklist(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const multi = redis_client_js_1.redisClient.multi();
            multi.sAdd(BLACKLIST_KEY, token);
            multi.expire(BLACKLIST_KEY, BLACKLIST_TTL);
            yield multi.exec();
        });
    }
    isBlacklisted(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield redis_client_js_1.redisClient.sIsMember(BLACKLIST_KEY, token);
            return result;
        });
    }
}
exports.RedisService = RedisService;
