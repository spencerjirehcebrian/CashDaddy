"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const createRateLimiter = (windowMs = 15 * 60 * 1000, // 15 minutes
max = 100 // limit each IP to 100 requests per windowMs
) => {
    return (0, express_rate_limit_1.default)({
        windowMs,
        max,
        message: 'Too many requests from this IP, please try again later.',
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
        handler: (_req, res) => {
            res.status(429).json({
                success: false,
                message: 'Too many requests, please try again later.'
            });
        }
    });
};
exports.createRateLimiter = createRateLimiter;
