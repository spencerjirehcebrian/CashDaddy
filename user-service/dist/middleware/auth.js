"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const server_1 = require("../server");
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const auth = async (req, res, next) => {
    const token = req.header("x-auth-token");
    if (!token) {
        return res.status(401).json({ msg: "No token, authorization denied" });
    }
    try {
        // Check if the token is blacklisted
        const isBlacklisted = await server_1.redisClient.get(`blacklist:${token}`);
        if (isBlacklisted) {
            return res.status(401).json({ msg: "Token is no longer valid" });
        }
        // Verify the token
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        req.token = token; // Store the token for potential use in logout
        next();
    }
    catch (err) {
        res.status(401).json({ msg: "Token is not valid" });
    }
};
exports.auth = auth;
