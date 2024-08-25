import express from 'express';
import cors from 'cors';
import { setCacheManager } from './decorators/caching.decorator.js';
import routes from './routes/index.js';
import { AuthService } from './services/auth/auth.service.js';
import { RedisService } from './services/redis/redis.service.js';
import { UserController } from './controller/user.controller.js';
import { UserProfileController } from './controller/user-profile.controller.js';
import { CacheManager } from './services/cache/cache-manager.service.js';
import { AuthMiddleware, ErrorHandler } from '@cash-daddy/shared';

const createApp = (
  redisService: RedisService,
  userController: UserController,
  userProfileController: UserProfileController,
  authService: AuthService
) => {
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
  app.use('/api', routes(userController, userProfileController, authMiddleware));

  app.use(ErrorHandler);

  return app;
};

export default createApp;
