"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProfileController = void 0;
const user_profile_service_1 = require("../services/db/user-profile.service");
const response_1 = require("../utils/response");
const error_types_1 = require("../types/error.types");
class UserProfileController {
    static async createProfile(req, res, next) {
        try {
            const user = req.user;
            const { dateOfBirth, phoneNumber, addressLine1, addressLine2, city, state, country, postalCode } = req.body;
            const profile = await user_profile_service_1.UserProfileService.createProfile(user.userId, new Date(dateOfBirth), phoneNumber, addressLine1, addressLine2, city, state, country, postalCode);
            (0, response_1.sendResponse)(res, 201, true, 'User profile created successfully', profile);
        }
        catch (error) {
            next(error);
        }
    }
    static async getOwnProfile(req, res, next) {
        try {
            const user = req.user;
            const profile = await user_profile_service_1.UserProfileService.getProfile(user.userId);
            if (!profile) {
                throw new error_types_1.NotFoundError('Profile not found');
            }
            (0, response_1.sendResponse)(res, 200, true, 'User profile retrieved successfully', profile);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateOwnProfile(req, res, next) {
        try {
            const user = req.user;
            const updateData = req.body;
            const updatedProfile = await user_profile_service_1.UserProfileService.updateProfile(user.userId, updateData);
            (0, response_1.sendResponse)(res, 200, true, 'User profile updated successfully', updatedProfile);
        }
        catch (error) {
            next(error);
        }
    }
    static async getProfile(req, res, next) {
        try {
            const userId = req.params.userId;
            const profile = await user_profile_service_1.UserProfileService.getProfile(userId);
            (0, response_1.sendResponse)(res, 200, true, 'User profile retrieved successfully', profile);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateProfile(req, res, next) {
        try {
            const userId = req.params.userId;
            const updateData = req.body;
            const updatedProfile = await user_profile_service_1.UserProfileService.updateProfile(userId, updateData);
            (0, response_1.sendResponse)(res, 200, true, 'User profile updated successfully', updatedProfile);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UserProfileController = UserProfileController;
