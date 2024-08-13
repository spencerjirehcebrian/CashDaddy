"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheManager = void 0;
const logger_1 = __importDefault(require("../../utils/logger"));
const DEFAULT_CACHE_TTL = 3600; // Default TTL of 1 hour
class CacheManager {
    constructor(cacheService) {
        this.cacheService = cacheService;
    }
    async cacheMethod(key, method, ttl = DEFAULT_CACHE_TTL) {
        const cachedResult = await this.cacheService.hgetall(key);
        if (Object.keys(cachedResult).length > 0) {
            logger_1.default.info(`Cache hit: ${key}`);
            return this.deserializeHashData(cachedResult);
        }
        const result = await method();
        const serializedData = this.serializeForHash(this.extractData(result));
        await this.cacheService.hsetex(key, ttl, serializedData);
        return result;
    }
    async invalidateCache(key) {
        await this.cacheService.del(key);
    }
    serializeForHash(data) {
        const serialized = {};
        for (const [key, value] of Object.entries(data)) {
            serialized[key] = JSON.stringify(value);
        }
        return serialized;
    }
    deserializeHashData(data) {
        const deserialized = {};
        for (const [key, value] of Object.entries(data)) {
            try {
                deserialized[key] = JSON.parse(value);
            }
            catch (error) {
                logger_1.default.error(`Failed to parse value for key ${key}: ${error instanceof Error ? error.message : String(error)}`);
                deserialized[key] = value;
            }
        }
        return deserialized;
    }
    extractData(result) {
        if (result && typeof result === 'object') {
            const doc = result;
            if (doc._doc) {
                return { ...doc._doc };
            }
            else if (doc.toObject && typeof doc.toObject === 'function') {
                return doc.toObject();
            }
            else {
                return { ...result };
            }
        }
        return { value: result };
    }
}
exports.CacheManager = CacheManager;
