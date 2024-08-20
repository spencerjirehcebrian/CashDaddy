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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheManager = void 0;
const mongoose_1 = require("mongoose");
const logger_js_1 = __importDefault(require("../../utils/logger.js"));
const DEFAULT_CACHE_TTL = 3600;
class CacheManager {
    constructor(cacheService) {
        this.cacheService = cacheService;
    }
    cacheMethod(key_1, method_1) {
        return __awaiter(this, arguments, void 0, function* (key, method, ttl = DEFAULT_CACHE_TTL) {
            const cachedResult = yield this.cacheService.hgetall(key);
            if (Object.keys(cachedResult).length > 0) {
                logger_js_1.default.info(`Cache hit: ${key}`);
                return this.deserializeData(cachedResult);
            }
            const result = yield method();
            const serializedData = this.serializeData(this.applyMongooseTransform(result));
            yield this.cacheService.hsetex(key, ttl, serializedData);
            return result;
        });
    }
    invalidateCache(key) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.cacheService.del(key);
        });
    }
    serializeData(data) {
        if (Array.isArray(data)) {
            return Object.assign({ __isArray: "true" }, data.reduce((acc, item, index) => {
                acc[index.toString()] = JSON.stringify(item);
                return acc;
            }, {}));
        }
        else if (data && typeof data === "object") {
            return this.serializeForHash(this.extractData(data));
        }
        else {
            return { value: JSON.stringify(data) };
        }
    }
    deserializeData(data) {
        if (data.__isArray === "true") {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { __isArray } = data, arrayData = __rest(data, ["__isArray"]);
            return Object.entries(arrayData)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([, value]) => JSON.parse(value));
        }
        else {
            return this.deserializeHashData(data);
        }
    }
    serializeForHash(data) {
        const serialized = {};
        for (const [key, value] of Object.entries(data)) {
            serialized[key] = JSON.stringify(value);
        }
        return serialized;
    }
    deserializeHashData(data) {
        const deserialized = {};
        for (const [key, value] of Object.entries(data)) {
            try {
                deserialized[key] = JSON.parse(value);
            }
            catch (error) {
                logger_js_1.default.error(`Failed to parse value for key ${key}: ${error instanceof Error ? error.message : String(error)}`);
                deserialized[key] = value;
            }
        }
        return deserialized;
    }
    extractData(result) {
        if (result && typeof result === "object") {
            const doc = result;
            if (doc._doc) {
                return Object.assign({}, doc._doc);
            }
            else if (doc.toObject && typeof doc.toObject === "function") {
                return doc.toObject();
            }
            else {
                return Object.assign({}, result);
            }
        }
        return { value: result };
    }
    applyMongooseTransform(data) {
        if (Array.isArray(data)) {
            return data.map((item) => this.applyMongooseTransform(item));
        }
        else if (data instanceof mongoose_1.Document) {
            return data.toJSON();
        }
        else if (data &&
            typeof data === "object" &&
            "toJSON" in data &&
            typeof data.toJSON === "function") {
            return data.toJSON();
        }
        return data;
    }
}
exports.CacheManager = CacheManager;
