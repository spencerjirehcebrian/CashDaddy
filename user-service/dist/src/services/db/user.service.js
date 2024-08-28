var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import mongoose from 'mongoose';
import { UserRole, UserStatus } from '../../interfaces/models/user.interface.js';
import { User } from '../../models/user.model.js';
import { Cacheable, CacheInvalidate } from '../../decorators/caching.decorator.js';
import { BadRequestError, NotFoundError } from '@cash-daddy/shared';
export class UserService {
    async register(email, password, firstName, lastName) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new BadRequestError('User already exists');
        }
        const isFirstUser = !(await User.findOne().select('_id').lean().exec());
        const user = new User({
            email,
            password,
            firstName,
            lastName,
            status: UserStatus.INACTIVE,
            role: isFirstUser ? UserRole.ADMIN : UserRole.USER
        });
        await user.save();
        return user;
    }
    async login(email, password) {
        const user = await User.findOne({ email });
        if (!user) {
            throw new BadRequestError('Account not found');
        }
        const isPasswordValid = await user.isValidPassword(password);
        if (!isPasswordValid) {
            throw new BadRequestError('Invalid credentials');
        }
        let effectiveRole = user.role;
        if (user.role === UserRole.ADMIN) {
            const isFirstAdmin = !(await User.findOne({
                role: UserRole.ADMIN,
                _id: { $lt: user._id }
            })
                .select('_id')
                .lean()
                .exec());
            if (isFirstAdmin) {
                effectiveRole = UserRole.SUPER_ADMIN;
            }
        }
        const authPayload = {
            userId: user._id.toString(),
            email: user.email,
            role: effectiveRole,
            status: user.status || undefined
        };
        return authPayload;
    }
    async getUserById(userId) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new NotFoundError('Invalid user ID');
        }
        const user = await User.findById(userId).populate('userProfile').exec();
        if (!user) {
            throw new NotFoundError('User not found');
        }
        return user;
    }
    async updateUser(userId, updateData) {
        const user = await User.findById(userId);
        if (!user) {
            throw new NotFoundError('User not found');
        }
        Object.assign(user, updateData);
        await user.save();
        return user;
    }
    async getAllUsers() {
        return User.find({}).populate('userProfile').exec();
    }
    async deleteUser(userId) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new NotFoundError('Invalid user ID');
        }
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            throw new NotFoundError('User not found');
        }
    }
    async deactivateUser(userId) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new NotFoundError('Invalid user ID');
        }
        const user = await User.findById(userId);
        if (!user) {
            throw new NotFoundError('User not found');
        }
        if (user.status === UserStatus.INACTIVE) {
            throw new BadRequestError('User is already inactive');
        }
        await user.save();
        return user;
    }
    async reactivateUser(userId) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new NotFoundError('Invalid user ID');
        }
        const user = await User.findById(userId);
        if (!user) {
            throw new NotFoundError('User not found');
        }
        if (user.status === UserStatus.ACTIVE) {
            throw new BadRequestError('User is already active');
        }
        user.status = UserStatus.ACTIVE;
        await user.save();
        return user;
    }
    async promoteUserToAdmin(userId) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new NotFoundError('Invalid user ID');
        }
        const user = await User.findById(userId);
        if (!user) {
            throw new NotFoundError('User not found');
        }
        if (user.role === UserRole.ADMIN) {
            throw new BadRequestError('User is already admin');
        }
        user.role = UserRole.ADMIN;
        await user.save();
        return user;
    }
}
__decorate([
    Cacheable({ keyPrefix: 'user' })
], UserService.prototype, "getUserById", null);
__decorate([
    CacheInvalidate({ keyPrefix: 'user' })
], UserService.prototype, "updateUser", null);
__decorate([
    Cacheable({ keyPrefix: 'all-users' })
], UserService.prototype, "getAllUsers", null);
__decorate([
    CacheInvalidate({ keyPrefix: 'user' })
], UserService.prototype, "deleteUser", null);
__decorate([
    CacheInvalidate({ keyPrefix: 'user' })
], UserService.prototype, "deactivateUser", null);
__decorate([
    CacheInvalidate({ keyPrefix: 'user' })
], UserService.prototype, "reactivateUser", null);
__decorate([
    CacheInvalidate({ keyPrefix: 'user' })
], UserService.prototype, "promoteUserToAdmin", null);
