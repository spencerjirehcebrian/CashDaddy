import { ICacheService } from '../../interfaces/services/cache-service.interface';
import { redisClient } from '../../utils/redis-client';

export class RedisService implements ICacheService {
  async set(key: string, value: string, expiration?: number): Promise<void> {
    await redisClient.set(key, value);
    if (expiration) {
      await redisClient.expire(key, expiration);
    }
  }

  async get(key: string): Promise<string | null> {
    return await redisClient.get(key);
  }

  async del(key: string): Promise<void> {
    await redisClient.del(key);
  }

  async setex(key: string, seconds: number, value: string): Promise<void> {
    await redisClient.setEx(key, seconds, value);
  }

  async hset(key: string, field: string, value: string): Promise<void> {
    await redisClient.hSet(key, field, value);
  }

  async hget(key: string, field: string): Promise<string | undefined> {
    return await redisClient.hGet(key, field);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return await redisClient.hGetAll(key);
  }

  async hdel(key: string, field: string): Promise<void> {
    await redisClient.hDel(key, field);
  }

  async hsetex(key: string, seconds: number, fields: Record<string, string>): Promise<void> {
    await redisClient.hSet(key, fields);
    await redisClient.expire(key, seconds);
  }
  async keys(pattern: string): Promise<string[]> {
    return await redisClient.keys(pattern);
  }
}
