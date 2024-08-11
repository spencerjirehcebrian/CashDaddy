import { createClient } from 'redis';
import { config } from '../config';

export const redisClient = createClient({
  url: config.REDIS_URL
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Connected to Redis:', config.REDIS_URL));
