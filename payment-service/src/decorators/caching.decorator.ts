import { CustomLogger } from '@cash-daddy/shared';
import { CacheManager } from 'src/services/cache/cache-manager.service.js';

let cacheManager: CacheManager;

export function setCacheManager(manager: CacheManager) {
  cacheManager = manager;
}

export interface CacheOptions {
  ttl?: number;
  keyPrefix: string;
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
      CustomLogger.error('Original method is not defined in Cacheable decorator.');
      return descriptor;
    }

    descriptor.value = function (this: unknown, ...args: Parameters<T>): Promise<ReturnType<T>> {
      if (!cacheManager) {
        throw new Error('CacheManager is not initialized. Cannot cache method.');
      }
      const cacheKey = `${options.keyPrefix}:${args.join(':')}`;
      CustomLogger.info(`Cacheable decorator: caching method ${String(_propertyKey)} with key ${cacheKey}`);

      return cacheManager.cacheMethod(cacheKey, () => originalMethod.apply(this, args), options.ttl) as Promise<ReturnType<T>>;
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
      const cacheKey = `${options.keyPrefix}:${args.join(':')}`;
      await cacheManager.invalidateCache(cacheKey);
      return result;
    } as T;

    return descriptor;
  };
}
