import { IRedisService } from "../../interfaces/services/redis.service.interface.js";
export declare class CacheManager {
    private cacheService;
    constructor(cacheService: IRedisService);
    cacheMethod<T>(key: string, method: () => Promise<T>, ttl?: number): Promise<T>;
    invalidateCache(key: string): Promise<void>;
    private serializeData;
    private deserializeData;
    private serializeForHash;
    private deserializeHashData;
    private extractData;
    private applyMongooseTransform;
}
