let cacheManager;
export function setCacheManager(manager) {
    cacheManager = manager;
}
export function Cacheable(options) {
    return function (_target, _propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        if (!originalMethod) {
            return descriptor;
        }
        descriptor.value = function (...args) {
            const cacheKey = `${options.keyPrefix}:${args.join(':')}`;
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
//# sourceMappingURL=caching.decorator.js.map