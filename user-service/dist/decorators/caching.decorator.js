"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCacheManager = setCacheManager;
exports.Cacheable = Cacheable;
exports.CacheInvalidate = CacheInvalidate;
let cacheManager;
function setCacheManager(manager) {
    cacheManager = manager;
}
function Cacheable(options) {
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
function CacheInvalidate(options) {
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
