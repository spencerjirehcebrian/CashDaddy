"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../../config");
const error_types_1 = require("../../types/error.types");
const JWT_SECRET = config_1.config.JWT_SECRET;
class AuthService {
    generateToken(payload) {
        return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    }
    verifyToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            return decoded;
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new error_types_1.NotAuthorizedError('Token has expired');
            }
            throw new error_types_1.NotAuthorizedError('Invalid token');
        }
    }
}
exports.AuthService = AuthService;
