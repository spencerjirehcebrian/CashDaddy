import express from 'express';
import cors from 'cors';
import { AuthMiddleware, AuthService, ErrorHandler } from '@cash-daddy/shared';
import { KYCController } from './controller/kyc.controller.js';
import routes from './routes/index.js';
import { RedisService } from './services/redis/redis.service.js';
import { CacheManager } from './services/cache/cache-manager.service.js';
import { setCacheManager } from './decorators/caching.decorator.js';

const createApp = (kycController: KYCController, redisService: RedisService, authService: AuthService) => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const corsOptions = {
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  };

  app.use(cors(corsOptions));

  const cacheManager = new CacheManager(redisService);
  setCacheManager(cacheManager);

  // Create AuthMiddleware instance
  const authMiddleware = new AuthMiddleware(authService, redisService);

  // Set up routes
  app.use('/api', routes(kycController, authMiddleware));

  app.use(ErrorHandler);

  return app;
};
export default createApp;
