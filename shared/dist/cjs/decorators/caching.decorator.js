"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
            const cacheKey = `${options.keyPrefix}:${args.join(":")}`;
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
        descriptor.value = function (...args) {
            return __awaiter(this, void 0, void 0, function* () {
                const result = yield originalMethod.apply(this, args);
                const cacheKey = `${options.keyPrefix}:${args.join(":")}`;
                yield cacheManager.invalidateCache(cacheKey);
                return result;
            });
        };
        return descriptor;
    };
}
