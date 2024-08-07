"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = exports.logout = exports.login = exports.register = void 0;
const express_validator_1 = require("express-validator");
const User_1 = require("../models/User");
const types_1 = require("../types");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const server_1 = require("../server");
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const TOKEN_EXPIRY = 3600; // 1 hour in seconds
const CACHE_TTL = 3600; // Cache for 1 hour
const register = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password, role, firstName, lastName } = req.body;
    try {
        const existingUser = await User_1.User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ errors: [{ msg: "User already exists" }] });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const user = new User_1.User({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            role: role || types_1.UserRole.USER,
        });
        await user.save();
        const userPayload = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
        };
        const token = jsonwebtoken_1.default.sign(userPayload, JWT_SECRET, { expiresIn: "1h" });
        // Cache user data
        await server_1.redisClient.setEx(`user:${user.id}`, CACHE_TTL, JSON.stringify(userPayload));
        res.status(201).json({ token });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ errors: [{ msg: "Server error" }] });
    }
};
exports.register = register;
const login = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
        const user = await User_1.User.findOne({ email });
        if (!user) {
            return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });
        }
        const userPayload = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
        };
        console.log(JWT_SECRET);
        const token = jsonwebtoken_1.default.sign(userPayload, JWT_SECRET, { expiresIn: "1h" });
        // Cache user data
        await server_1.redisClient.setEx(`user:${user.id}`, CACHE_TTL, JSON.stringify(userPayload));
        res.json({ token });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ errors: [{ msg: "Server error" }] });
    }
};
exports.login = login;
const logout = async (req, res) => {
    const token = req.header("x-auth-token");
    if (!token) {
        return res.status(400).json({ msg: "No token provided" });
    }
    try {
        // Add the token to the blacklist
        await server_1.redisClient.setEx(`blacklist:${token}`, TOKEN_EXPIRY, "true");
        res.json({ msg: "Logged out successfully" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
};
exports.logout = logout;
const getUserById = async (req, res) => {
    const userId = req.params.id;
    try {
        // Try to get user from cache
        const cachedUser = await server_1.redisClient.get(`user:${userId}`);
        if (cachedUser) {
            return res.json(JSON.parse(cachedUser));
        }
        // If not in cache, get from database
        const user = await User_1.User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }
        // Cache the user data
        await server_1.redisClient.setEx(`user:${userId}`, CACHE_TTL, JSON.stringify(user));
        res.json(user);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
};
exports.getUserById = getUserById;
