import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

export const createRateLimiter = (
  windowMs: number = 15 * 60 * 1000, // 15 minutes
  max: number = 100 // limit each IP to 100 requests per windowMs
) => {
  return rateLimit({
    windowMs,
    max,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (_req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later.'
      });
    }
  });
};
