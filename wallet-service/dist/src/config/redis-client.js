import { createClient } from 'redis';
import { config } from './index.js';
import { CustomLogger } from '@cash-daddy/shared';
export const redisClient = createClient({
    url: config.REDIS_URL
});
redisClient.on('error', (err) => CustomLogger.error('Redis Client Error', err));
redisClient.on('connect', () => CustomLogger.info('Connected to Redis:', config.REDIS_URL));
