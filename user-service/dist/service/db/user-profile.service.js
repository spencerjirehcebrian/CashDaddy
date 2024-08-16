"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProfileService = void 0;
const user_profile_model_1 = require("../../models/user-profile.model");
const error_types_1 = require("../../types/error.types");
class UserProfileService {
    static async createProfile(userId, dateOfBirth, address, phoneNumber) {
        const profile = new user_profile_model_1.UserProfile({
            user: userId,
            dateOfBirth,
            address,
            phoneNumber
        });
        await profile.save();
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
