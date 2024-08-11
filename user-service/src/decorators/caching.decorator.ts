import { redisService } from '../services/redis/redis.service';
import logger from '../utils/logger';

const DEFAULT_CACHE_TTL = 3600; // Default TTL of 1 hour

export interface CacheOptions {
  ttl?: number;
  keyPrefix: string;
}

interface MongooseDocument {
  _doc?: Record<string, unknown>;
  toObject?: () => Record<string, unknown>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any;

export function Cacheable(options: CacheOptions) {
  return function <T extends AnyFunction>(
    _target: object,
    _propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>
  ): TypedPropertyDescriptor<T> {
    const originalMethod = descriptor.value;
    if (!originalMethod) {
      return descriptor;
    }

    descriptor.value = async function (this: unknown, ...args: Parameters<T>): Promise<ReturnType<T>> {
      const cacheKey = `${options.keyPrefix}:${args.join(':')}`;

      // Try to get from cache
      const cachedResult = await redisService.hgetall(cacheKey);
      if (Object.keys(cachedResult).length > 0) {
        logger.info(`Cache hit: ${cacheKey}`);
        return deserializeHashData(cachedResult) as ReturnType<T>;
      }

      // If not in cache, call the original method
      const result = await originalMethod.apply(this, args);

      // Cache the result
      const ttl = options.ttl ?? DEFAULT_CACHE_TTL;
      const serializedData = serializeForHash(extractData(result));
      await redisService.hsetex(cacheKey, ttl, serializedData);

      return result;
    } as T;

    return descriptor;
  };
}

export function CacheInvalidate(options: CacheOptions) {
  return function <T extends AnyFunction>(
    _target: object,
    _propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>
  ): TypedPropertyDescriptor<T> {
    const originalMethod = descriptor.value;
    if (!originalMethod) {
      return descriptor;
    }

    descriptor.value = async function (this: unknown, ...args: Parameters<T>): Promise<ReturnType<T>> {
      const result = await originalMethod.apply(this, args);

      // Invalidate cache
      const cacheKey = `${options.keyPrefix}:${args.join(':')}`;
      await redisService.del(cacheKey);

      return result;
    } as T;

    return descriptor;
  };
}

function serializeForHash(data: Record<string, unknown>): Record<string, string> {
  const serialized: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    serialized[key] = JSON.stringify(value);
  }
  return serialized;
}

function deserializeHashData(data: Record<string, string>): Record<string, unknown> {
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

function extractData(result: unknown): Record<string, unknown> {
  if (result && typeof result === 'object') {
    const doc = result as MongooseDocument;
    if (doc._doc) {
      // If it's a Mongoose document, return only the _doc part
      return { ...doc._doc };
    } else if (doc.toObject && typeof doc.toObject === 'function') {
      // If it has a toObject method (like Mongoose documents), use that
      return doc.toObject();
    } else {
      // For regular objects, return a shallow copy
      return { ...(result as Record<string, unknown>) };
    }
  }
  // For primitives or other types, return as an object
  return { value: result };
}
