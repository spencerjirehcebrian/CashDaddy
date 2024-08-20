import express from 'express';
import { json } from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes';
import { AuthMiddleware, AuthService, CacheManager, RedisService, setCacheManager } from '@cash-daddy/shared';

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
const authService = new AuthService();

// Create AuthMiddleware instance
const authMiddleware = new AuthMiddleware(authService, redisService);

// Create instances of controllers with injected dependencies

// Set up routes
app.use('/api', routes(authMiddleware));

app.use(errorHandler);

export default app;
