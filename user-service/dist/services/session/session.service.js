"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionService = void 0;
const uuid_1 = require("uuid");
const redis_service_1 = require("../redis/redis.service");
const logger_1 = __importDefault(require("../../utils/logger"));
class SessionService {
    constructor() {
        this.SESSION_EXPIRATION = 3600; // 1 hour
    }
    convertToStringRecord(data) {
        const result = {};
        for (const [key, value] of Object.entries(data)) {
            result[key] = typeof value === 'string' ? value : JSON.stringify(value);
            logger_1.default.debug(`Converted ${key} to ${result[key]}`);
        }
        return result;
    }
    parseStringRecord(data) {
        const result = {};
        for (const [key, value] of Object.entries(data)) {
            try {
                result[key] = JSON.parse(value);
            }
            catch {
                result[key] = value;
            }
        }
        return result;
    }
    async createSession(authPayload) {
        await this.deleteExistingSession(authPayload.userId);
        const sessionId = (0, uuid_1.v4)();
        const sessionData = {
            ...authPayload,
            createdAt: Date.now().toString()
        };
        logger_1.default.info('User logged in', sessionData);
        await redis_service_1.redisService.hsetex(`session:${sessionId}`, this.SESSION_EXPIRATION, this.convertToStringRecord(sessionData));
        return sessionId;
    }
    async deleteExistingSession(userId) {
        const sessions = await this.getAllSessions();
        for (const [sessionId, sessionData] of Object.entries(sessions)) {
            if (sessionData.userId === userId) {
                await this.deleteSession(sessionId);
                break;
            }
        }
    }
    async getAllSessions() {
        const keys = await redis_service_1.redisService.keys('session:*');
        const sessions = {};
        for (const key of keys) {
            const sessionId = key.split(':')[1];
            const sessionData = await this.getSession(sessionId);
            if (sessionData) {
                sessions[sessionId] = sessionData;
            }
        }
        return sessions;
    }
    async getSession(sessionId) {
        const sessionData = await redis_service_1.redisService.hgetall(`session:${sessionId}`);
        if (Object.keys(sessionData).length === 0) {
            return null;
        }
        return this.parseStringRecord(sessionData);
    }
    async updateSession(sessionId, updateData) {
        const existingSession = await this.getSession(sessionId);
        if (existingSession) {
            const updatedSessionData = { ...existingSession, ...updateData };
            await redis_service_1.redisService.hsetex(`session:${sessionId}`, this.SESSION_EXPIRATION, this.convertToStringRecord(updatedSessionData));
        }
    }
    async deleteSession(sessionId) {
        await redis_service_1.redisService.del(`session:${sessionId}`);
    }
    async refreshSession(sessionId) {
        const sessionData = await this.getSession(sessionId);
        if (sessionData) {
            await redis_service_1.redisService.hsetex(`session:${sessionId}`, this.SESSION_EXPIRATION, this.convertToStringRecord(sessionData));
        }
    }
    async getAuthPayload(sessionId) {
        const sessionData = await this.getSession(sessionId);
        if (sessionData) {
            const { ...authPayload } = sessionData;
            return authPayload;
        }
        return null;
    }
}
exports.sessionService = new SessionService();
