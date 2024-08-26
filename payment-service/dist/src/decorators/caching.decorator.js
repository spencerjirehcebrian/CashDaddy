import { CustomLogger } from '@cash-daddy/shared';
let cacheManager;
export function setCacheManager(manager) {
    cacheManager = manager;
}
export function Cacheable(options) {
    return function (_target, _propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        if (!originalMethod) {
            CustomLogger.error('Original method is not defined in Cacheable decorator.');
            return descriptor;
        }
        descriptor.value = function (...args) {
            if (!cacheManager) {
                throw new Error('CacheManager is not initialized. Cannot cache method.');
            }
            const cacheKey = `${options.keyPrefix}:${args.join(':')}`;
            CustomLogger.info(`Cacheable decorator: caching method ${String(_propertyKey)} with key ${cacheKey}`);
            return cacheManager.cacheMethod(cacheKey, () => originalMethod.apply(this, args), options.ttl);
        };
        return descriptor;
    };
}
export function CacheInvalidate(options) {
    return function (_target, _propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        if (!originalMethod) {
            return descriptor;
        }
        descriptor.value = async function (...args) {
            const result = await originalMethod.apply(this, args);
            const cacheKey = `${options.keyPrefix}:${args.join(':')}`;
            await cacheManager.invalidateCache(cacheKey);
            return result;
        };
        return descriptor;
    };
}
