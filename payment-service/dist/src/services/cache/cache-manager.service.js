import { Document } from 'mongoose';
import { CustomLogger } from '@cash-daddy/shared';
const DEFAULT_CACHE_TTL = 3600;
export class CacheManager {
    constructor(cacheService) {
        this.cacheService = cacheService;
        if (!cacheService) {
            CustomLogger.error('CacheService is not initialized in CacheManager constructor.');
        }
        else {
            CustomLogger.info('CacheManager initialized with CacheService.');
        }
    }
    async cacheMethod(key, method, ttl = DEFAULT_CACHE_TTL) {
        CustomLogger.info(`Attempting to cache method with key: ${key}`);
        const cachedResult = await this.cacheService.hgetall(key);
        if (Object.keys(cachedResult).length > 0) {
            CustomLogger.info(`Cache hit: ${key}`);
            return this.deserializeData(cachedResult);
        }
        CustomLogger.info(`Cache miss: ${key}. Executing method and caching result.`);
        const result = await method();
        const serializedData = this.serializeData(this.applyMongooseTransform(result));
        await this.cacheService.hsetex(key, ttl, serializedData);
        CustomLogger.info(`Method result cached with key: ${key}`);
        return result;
    }
    async invalidateCache(key) {
        if (!this.cacheService) {
            CustomLogger.error('CacheService is not initialized. Cannot invalidate cache.');
            throw new Error('CacheService is not initialized.');
        }
        CustomLogger.info(`Invalidating cache with key: ${key}`);
        await this.cacheService.del(key);
    }
    serializeData(data) {
        if (Array.isArray(data)) {
            return {
                __isArray: 'true',
                ...data.reduce((acc, item, index) => {
                    acc[index.toString()] = JSON.stringify(item);
                    return acc;
                }, {})
            };
        }
        else if (data && typeof data === 'object') {
            return this.serializeForHash(this.extractData(data));
        }
        else {
            return { value: JSON.stringify(data) };
        }
    }
    deserializeData(data) {
        if (data.__isArray === 'true') {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { __isArray, ...arrayData } = data;
            return Object.entries(arrayData)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([, value]) => JSON.parse(value));
        }
        else {
            return this.deserializeHashData(data);
        }
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
                CustomLogger.error(`Failed to parse value for key ${key}: ${error instanceof Error ? error.message : String(error)}`);
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
    applyMongooseTransform(data) {
        if (Array.isArray(data)) {
            return data.map((item) => this.applyMongooseTransform(item));
        }
        else if (data instanceof Document) {
            return data.toJSON();
        }
        else if (data && typeof data === 'object' && 'toJSON' in data && typeof data.toJSON === 'function') {
            return data.toJSON();
        }
        return data;
    }
}
