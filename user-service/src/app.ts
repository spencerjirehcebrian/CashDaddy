import express from 'express';
import { json } from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { UserService } from './services/db/user.service';
import { AuthService } from './services/auth/auth.service';
import { UserProfileService } from './services/db/user-profile.service';
import { RedisService } from './services/redis/redis.service';
import { setCacheManager } from './decorators/caching.decorator';
import routes from './routes';
import errorHandler from './middlewares/error.middleware';
import { CacheManager } from './services/cache/cache-manager.service';
import { UserController } from './controller/user.controller';
import { UserProfileController } from './controller/user-profile.controller';
import { KYCService } from './services/db/kyc.service';
import { KYCController } from './controller/kyc.controller';

const app = express();
app.use(json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

const redisService = new RedisService();
const cacheManager = new CacheManager(redisService);
setCacheManager(cacheManager);

// Create instances of services
const userService = new UserService();
const authService = new AuthService();
const userProfileService = new UserProfileService();
const kycService = new KYCService();

// Create instances of controllers with injected dependencies
const userController = new UserController(userService, authService);
const userProfileController = new UserProfileController(userProfileService);
const kycController = new KYCController(kycService);

// Set up routes
app.use('/api', routes(userController, userProfileController, kycController));

app.use(errorHandler);

export default app;
