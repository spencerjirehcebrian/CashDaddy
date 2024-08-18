import { CacheManager } from '../services/cache/cache-manager.service';
export declare function setCacheManager(manager: CacheManager): void;
export interface CacheOptions {
    ttl?: number;
    keyPrefix: string;
}
type AnyFunction = (...args: any[]) => any;
export declare function Cacheable(options: CacheOptions): <T extends AnyFunction>(_target: object, _propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => TypedPropertyDescriptor<T>;
export declare function CacheInvalidate(options: CacheOptions): <T extends AnyFunction>(_target: object, _propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => TypedPropertyDescriptor<T>;
export {};
