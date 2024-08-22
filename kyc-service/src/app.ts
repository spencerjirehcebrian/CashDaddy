import express from 'express';
import { json } from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { AuthMiddleware, AuthService, CacheManager, ErrorHandler, RedisService, setCacheManager } from '@cash-daddy/shared';
import { KYCService } from './services/db/kyc.service.js';
import { KYCController } from './controller/kyc.controller.js';
import routes from './routes/index.js';

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

const authService = new AuthService();

const redisService = new RedisService();
const cacheManager = new CacheManager(redisService);
setCacheManager(cacheManager);

// Create instances of services
const kycService = new KYCService();

// Create AuthMiddleware instance
const authMiddleware = new AuthMiddleware(authService, redisService);

// Create instances of controllers with injected dependencies
const kycController = new KYCController(kycService);

// Set up routes
app.use('/api', routes(kycController, authMiddleware));

app.use(ErrorHandler);

export default app;
