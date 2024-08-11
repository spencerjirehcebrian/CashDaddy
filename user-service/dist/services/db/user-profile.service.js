"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProfileService = void 0;
const caching_decorator_1 = require("../../decorators/caching.decorator");
const user_profile_model_1 = require("../../models/user-profile.model");
const user_model_1 = require("../../models/user.model");
const error_types_1 = require("../../types/error.types");
class UserProfileService {
    static async createProfile(userId, dateOfBirth, phoneNumber, addressLine1, addressLine2, city, state, country, postalCode) {
        const profile = new user_profile_model_1.UserProfile({
            user: userId,
            dateOfBirth,
            phoneNumber,
            addressLine1,
            addressLine2,
            city,
            state,
            country,
            postalCode
        });
        await profile.save();
        await user_model_1.User.findByIdAndUpdate(userId, { userProfile: profile._id });
        return profile;
    }
    static async getProfile(userId) {
        const profile = await user_profile_model_1.UserProfile.findOne({ user: userId });
        if (!profile) {
            throw new error_types_1.NotFoundError('User profile not found');
        }
        return profile;
    }
    static async updateProfile(userId, updateData) {
        const profile = await user_profile_model_1.UserProfile.findOneAndUpdate({ user: userId }, updateData, { new: true, runValidators: true });
        if (!profile) {
            throw new error_types_1.NotFoundError('User profile not found');
        }
        return profile;
    }
}
exports.UserProfileService = UserProfileService;
__decorate([
    (0, caching_decorator_1.CacheInvalidate)({ keyPrefix: 'user-profile' })
], UserProfileService, "createProfile", null);
__decorate([
    (0, caching_decorator_1.Cacheable)({ keyPrefix: 'user-profile' })
], UserProfileService, "getProfile", null);
__decorate([
    (0, caching_decorator_1.CacheInvalidate)({ keyPrefix: 'user-profile' })
], UserProfileService, "updateProfile", null);
