import { v4 as uuidv4 } from 'uuid';
import { redisService } from '../redis/redis.service';
import { AuthPayload, SessionData } from '../../types/auth.types';
import logger from '../../utils/logger';

class SessionService {
  private readonly SESSION_EXPIRATION = 3600; // 1 hour

  private convertToStringRecord(data: Record<string, unknown>): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = typeof value === 'string' ? value : JSON.stringify(value);
      logger.debug(`Converted ${key} to ${result[key]}`);
    }
    return result;
  }

  private parseStringRecord(data: Record<string, string>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      try {
        result[key] = JSON.parse(value);
      } catch {
        result[key] = value;
      }
    }
    return result;
  }

  async createSession(authPayload: AuthPayload): Promise<string> {
    await this.deleteExistingSession(authPayload.userId);
    const sessionId = uuidv4();
    const sessionData: SessionData = {
      ...authPayload,
      createdAt: Date.now().toString()
    };
    logger.info('User logged in', sessionData);
    await redisService.hsetex(`session:${sessionId}`, this.SESSION_EXPIRATION, this.convertToStringRecord(sessionData));
    return sessionId;
  }

  private async deleteExistingSession(userId: string): Promise<void> {
    const sessions = await this.getAllSessions();
    for (const [sessionId, sessionData] of Object.entries(sessions)) {
      if (sessionData.userId === userId) {
        await this.deleteSession(sessionId);
        break;
      }
    }
  }

  async getAllSessions(): Promise<Record<string, SessionData>> {
    const keys = await redisService.keys('session:*');
    const sessions: Record<string, SessionData> = {};
    for (const key of keys) {
      const sessionId = key.split(':')[1];
      const sessionData = await this.getSession(sessionId);
      if (sessionData) {
        sessions[sessionId] = sessionData;
      }
    }
    return sessions;
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    const sessionData = await redisService.hgetall(`session:${sessionId}`);
    if (Object.keys(sessionData).length === 0) {
      return null;
    }
    return this.parseStringRecord(sessionData) as SessionData;
  }

  async updateSession(sessionId: string, updateData: Partial<AuthPayload>): Promise<void> {
    const existingSession = await this.getSession(sessionId);
    if (existingSession) {
      const updatedSessionData: SessionData = { ...existingSession, ...updateData };
      await redisService.hsetex(`session:${sessionId}`, this.SESSION_EXPIRATION, this.convertToStringRecord(updatedSessionData));
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    await redisService.del(`session:${sessionId}`);
  }

  async refreshSession(sessionId: string): Promise<void> {
    const sessionData = await this.getSession(sessionId);
    if (sessionData) {
      await redisService.hsetex(`session:${sessionId}`, this.SESSION_EXPIRATION, this.convertToStringRecord(sessionData));
    }
  }

  async getAuthPayload(sessionId: string): Promise<AuthPayload | null> {
    const sessionData = await this.getSession(sessionId);
    if (sessionData) {
      const { ...authPayload } = sessionData;
      return authPayload;
    }
    return null;
  }
}

export const sessionService = new SessionService();
