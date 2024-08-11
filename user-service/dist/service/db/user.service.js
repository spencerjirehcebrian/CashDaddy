"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_interface_1 = require("../../interfaces/user.interface");
const user_model_1 = require("../../models/user.model");
const error_types_1 = require("../../types/error.types");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class UserService {
    static async register(email, password, firstName, lastName) {
        const existingUser = await user_model_1.User.findOne({ email });
        if (existingUser) {
            throw new error_types_1.BadRequestError('User already exists');
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = new user_model_1.User({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            role: user_interface_1.UserRole.USER
        });
        await user.save();
        return user;
    }
    static async login(email, password) {
        const user = await user_model_1.User.findOne({ email });
        if (!user) {
            throw new error_types_1.BadRequestError('Invalid credentials');
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            throw new error_types_1.BadRequestError('Invalid credentials');
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return token;
    }
    static async getUserById(userId) {
        const user = await user_model_1.User.findById(userId);
        if (!user) {
            throw new error_types_1.NotFoundError('User not found');
        }
        return user;
    }
    static async updateUser(userId, updateData) {
        const user = await user_model_1.User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });
        if (!user) {
            throw new error_types_1.NotFoundError('User not found');
        }
        return user;
    }
}
exports.UserService = UserService;
