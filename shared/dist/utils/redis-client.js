import { createClient } from 'redis';
import { config } from '../config';
import logger from './logger';
export const redisClient = createClient({
    url: config.REDIS_URL
});
redisClient.on('error', (err) => logger.error('Redis Client Error', err));
redisClient.on('connect', () => logger.info('Connected to Redis:', config.REDIS_URL));
//# sourceMappingURL=redis-client.js.map