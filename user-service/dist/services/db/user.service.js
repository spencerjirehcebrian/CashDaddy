"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const user_interface_1 = require("../../interfaces/models/user.interface");
const user_model_1 = require("../../models/user.model");
const error_types_1 = require("../../types/error.types");
const caching_decorator_1 = require("../../decorators/caching.decorator");
const logger_1 = __importDefault(require("../../utils/logger"));
const kyc_interface_1 = require("../../interfaces/models/kyc.interface");
class UserService {
    async register(email, password, firstName, lastName) {
        const existingUser = await user_model_1.User.findOne({ email });
        if (existingUser) {
            throw new error_types_1.BadRequestError('User already exists');
        }
        const user = new user_model_1.User({
            email,
            password,
            firstName,
            lastName,
            role: user_interface_1.UserRole.USER
        });
        await user.save();
        return user;
    }
    async login(email, password) {
        const user = await user_model_1.User.findOne({ email });
        if (!user || user.status === user_interface_1.UserStatus.INACTIVE) {
            throw new error_types_1.BadRequestError('Invalid credentials or inactive account');
        }
        const isPasswordValid = await user.isValidPassword(password);
        if (!isPasswordValid) {
            throw new error_types_1.BadRequestError('Invalid credentials');
        }
        const authPayload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            status: user.status || undefined,
            verificationStatus: user.kyc?.verificationStatus || kyc_interface_1.VerificationStatus.NOT_SUBMITTED
        };
        logger_1.default.info('User logged in', authPayload);
        return authPayload;
    }
    async getUserById(userId) {
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            throw new error_types_1.NotFoundError('Invalid user ID');
        }
        const user = await user_model_1.User.findById(userId).populate('userProfile').populate('kyc').populate('paymentMethods').exec();
        if (!user) {
            throw new error_types_1.NotFoundError('User not found');
        }
        return user;
    }
    async updateUser(userId, updateData) {
        const user = await user_model_1.User.findById(userId);
        if (!user) {
            throw new error_types_1.NotFoundError('User not found');
        }
        Object.assign(user, updateData);
        await user.save();
        return user;
    }
    async getAllUsers() {
        return user_model_1.User.find({}).populate('userProfile').populate('kyc').populate('paymentMethods').exec();
    }
    async deleteUser(userId) {
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            throw new error_types_1.NotFoundError('Invalid user ID');
        }
        const user = await user_model_1.User.findByIdAndDelete(userId);
        if (!user) {
            throw new error_types_1.NotFoundError('User not found');
        }
    }
    async deactivateUser(userId) {
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            throw new error_types_1.NotFoundError('Invalid user ID');
        }
        const user = await user_model_1.User.findById(userId);
        if (!user) {
            throw new error_types_1.NotFoundError('User not found');
        }
        if (user.status === user_interface_1.UserStatus.INACTIVE) {
            throw new error_types_1.BadRequestError('User is already inactive');
        }
        await user.save();
        return user;
    }
    async reactivateUser(userId) {
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            throw new error_types_1.NotFoundError('Invalid user ID');
        }
        const user = await user_model_1.User.findById(userId);
        if (!user) {
            throw new error_types_1.NotFoundError('User not found');
        }
        if (user.status === user_interface_1.UserStatus.ACTIVE) {
            throw new error_types_1.BadRequestError('User is already active');
        }
        user.status = user_interface_1.UserStatus.ACTIVE;
        await user.save();
        return user;
    }
}
exports.UserService = UserService;
__decorate([
    (0, caching_decorator_1.Cacheable)({ keyPrefix: 'user' })
], UserService.prototype, "getUserById", null);
__decorate([
    (0, caching_decorator_1.CacheInvalidate)({ keyPrefix: 'user' })
], UserService.prototype, "updateUser", null);
__decorate([
    (0, caching_decorator_1.Cacheable)({ keyPrefix: 'all-users' })
], UserService.prototype, "getAllUsers", null);
__decorate([
    (0, caching_decorator_1.CacheInvalidate)({ keyPrefix: 'user' })
], UserService.prototype, "deleteUser", null);
__decorate([
    (0, caching_decorator_1.CacheInvalidate)({ keyPrefix: 'user' })
], UserService.prototype, "deactivateUser", null);
__decorate([
    (0, caching_decorator_1.CacheInvalidate)({ keyPrefix: 'user' })
], UserService.prototype, "reactivateUser", null);
