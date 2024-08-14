import { ICacheService } from '../../interfaces/services/cache-service.interface';
import logger from '../../utils/logger';
import { Document } from 'mongoose';

const DEFAULT_CACHE_TTL = 3600;

export class CacheManager {
  constructor(private cacheService: ICacheService) {}

  async cacheMethod<T>(key: string, method: () => Promise<T>, ttl: number = DEFAULT_CACHE_TTL): Promise<T> {
    const cachedResult = await this.cacheService.hgetall(key);
    if (Object.keys(cachedResult).length > 0) {
      logger.info(`Cache hit: ${key}`);
      return this.deserializeData(cachedResult) as T;
    }

    const result = await method();
    const serializedData = this.serializeData(this.applyMongooseTransform(result));
    await this.cacheService.hsetex(key, ttl, serializedData);

    return result;
  }

  async invalidateCache(key: string): Promise<void> {
    await this.cacheService.del(key);
  }

  private serializeData(data: unknown): Record<string, string> {
    if (Array.isArray(data)) {
      return {
        __isArray: 'true',
        ...data.reduce(
          (acc, item, index) => {
            acc[index.toString()] = JSON.stringify(item);
            return acc;
          },
          {} as Record<string, string>
        )
      };
    } else if (data && typeof data === 'object') {
      return this.serializeForHash(this.extractData(data));
    } else {
      return { value: JSON.stringify(data) };
    }
  }

  private deserializeData(data: Record<string, string>): unknown {
    if (data.__isArray === 'true') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { __isArray, ...arrayData } = data;
      return Object.entries(arrayData)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([, value]) => JSON.parse(value));
    } else {
      return this.deserializeHashData(data);
    }
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

  private applyMongooseTransform(data: unknown): unknown {
    if (Array.isArray(data)) {
      return data.map((item) => this.applyMongooseTransform(item));
    } else if (data instanceof Document) {
      return data.toJSON();
    } else if (data && typeof data === 'object' && 'toJSON' in data && typeof data.toJSON === 'function') {
      return data.toJSON();
    }
    return data;
  }
}
