"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../../models/user.model");
const user_profile_model_1 = require("../../models/user_profile.model");
const know_your_customer_model_1 = require("../../models/know_your_customer.model");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class userService {
    static async register(email, password, firstName, lastName) {
        const existingUser = await user_model_1.User.findOne({ email });
        if (existingUser) {
            throw new Error("Email already in use");
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = new user_model_1.User({
            email,
            password: hashedPassword,
            firstName,
            lastName,
        });
        await user.save();
        const userProfile = new user_profile_model_1.UserProfile({ user: user._id });
        await userProfile.save();
        const kyc = new know_your_customer_model_1.KnowYourCustomer({ user: user._id });
        await kyc.save();
        user.userProfile = userProfile._id;
        user.kyc = kyc._id;
        await user.save();
        return this.generateToken(user);
    }
    static async login(email, password) {
        const user = await user_model_1.User.findOne({ email });
        if (!user) {
            throw new Error("Invalid credentials");
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error("Invalid credentials");
        }
        return this.generateToken(user);
    }
    static generateToken(user) {
        const payload = {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
        };
        return jsonwebtoken_1.default.sign(payload, this.JWT_SECRET, { expiresIn: "1h" });
    }
}
exports.userService = userService;
userService.JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
