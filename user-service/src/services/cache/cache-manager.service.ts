import { ICacheService } from '../../interfaces/services/cache-service.interface';
import logger from '../../utils/logger';

const DEFAULT_CACHE_TTL = 3600; // Default TTL of 1 hour

export class CacheManager {
  constructor(private cacheService: ICacheService) {}

  async cacheMethod<T>(key: string, method: () => Promise<T>, ttl: number = DEFAULT_CACHE_TTL): Promise<T> {
    const cachedResult = await this.cacheService.hgetall(key);
    if (Object.keys(cachedResult).length > 0) {
      logger.info(`Cache hit: ${key}`);
      return this.deserializeHashData(cachedResult) as T;
    }

    const result = await method();
    const serializedData = this.serializeForHash(this.extractData(result));
    await this.cacheService.hsetex(key, ttl, serializedData);

    return result;
  }

  async invalidateCache(key: string): Promise<void> {
    await this.cacheService.del(key);
  }

  private serializeForHash(data: Record<string, unknown>): Record<string, string> {
    const serialized: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      serialized[key] = JSON.stringify(value);
    }
    return serialized;
  }

  private deserializeHashData(data: Record<string, string>): Record<string, unknown> {
    const deserialized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      try {
        deserialized[key] = JSON.parse(value);
      } catch (error) {
        logger.error(`Failed to parse value for key ${key}: ${error instanceof Error ? error.message : String(error)}`);
        deserialized[key] = value;
      }
    }
    return deserialized;
  }

  private extractData(result: unknown): Record<string, unknown> {
    if (result && typeof result === 'object') {
      const doc = result as { _doc?: Record<string, unknown>; toObject?: () => Record<string, unknown> };
      if (doc._doc) {
        return { ...doc._doc };
      } else if (doc.toObject && typeof doc.toObject === 'function') {
        return doc.toObject();
      } else {
        return { ...(result as Record<string, unknown>) };
      }
    }
    return { value: result };
  }
}
