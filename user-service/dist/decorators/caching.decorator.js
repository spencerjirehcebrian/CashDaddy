"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cacheable = Cacheable;
exports.CacheInvalidate = CacheInvalidate;
const redis_service_1 = require("../services/redis/redis.service");
const logger_1 = __importDefault(require("../utils/logger"));
const DEFAULT_CACHE_TTL = 3600; // Default TTL of 1 hour
function Cacheable(options) {
    return function (_target, _propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        if (!originalMethod) {
            return descriptor;
        }
        descriptor.value = async function (...args) {
            const cacheKey = `${options.keyPrefix}:${args.join(':')}`;
            // Try to get from cache
            const cachedResult = await redis_service_1.redisService.hgetall(cacheKey);
            if (Object.keys(cachedResult).length > 0) {
                logger_1.default.info(`Cache hit: ${cacheKey}`);
                return deserializeHashData(cachedResult);
            }
            // If not in cache, call the original method
            const result = await originalMethod.apply(this, args);
            // Cache the result
            const ttl = options.ttl ?? DEFAULT_CACHE_TTL;
            const serializedData = serializeForHash(extractData(result));
            await redis_service_1.redisService.hsetex(cacheKey, ttl, serializedData);
            return result;
        };
        return descriptor;
    };
}
function CacheInvalidate(options) {
    return function (_target, _propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        if (!originalMethod) {
            return descriptor;
        }
        descriptor.value = async function (...args) {
            const result = await originalMethod.apply(this, args);
            // Invalidate cache
            const cacheKey = `${options.keyPrefix}:${args.join(':')}`;
            await redis_service_1.redisService.del(cacheKey);
            return result;
        };
        return descriptor;
    };
}
function serializeForHash(data) {
    const serialized = {};
    for (const [key, value] of Object.entries(data)) {
        serialized[key] = JSON.stringify(value);
    }
    return serialized;
}
function deserializeHashData(data) {
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
function extractData(result) {
    if (result && typeof result === 'object') {
        const doc = result;
        if (doc._doc) {
            // If it's a Mongoose document, return only the _doc part
            return { ...doc._doc };
        }
        else if (doc.toObject && typeof doc.toObject === 'function') {
            // If it has a toObject method (like Mongoose documents), use that
            return doc.toObject();
        }
        else {
            // For regular objects, return a shallow copy
            return { ...result };
        }
    }
    // For primitives or other types, return as an object
    return { value: result };
}
