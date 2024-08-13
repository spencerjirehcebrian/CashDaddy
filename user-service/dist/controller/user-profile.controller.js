"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProfileController = void 0;
const response_1 = require("../utils/response");
const error_types_1 = require("../types/error.types");
class UserProfileController {
    constructor(userProfileService) {
        this.userProfileService = userProfileService;
    }
    async createProfile(req, res, next) {
        try {
            const userId = req.user.userId;
            const { dateOfBirth, phoneNumber, addressLine1, addressLine2, city, state, country, postalCode } = req.body;
            const profile = await this.userProfileService.createProfile(userId, dateOfBirth, phoneNumber, addressLine1, addressLine2, city, state, country, postalCode);
            (0, response_1.sendResponse)(res, 201, true, 'User profile created successfully', { profile });
        }
        catch (error) {
            next(error);
        }
    }
    async getOwnProfile(req, res, next) {
        try {
            const userId = req.user.userId;
            const profile = await this.userProfileService.getProfile(userId);
            (0, response_1.sendResponse)(res, 200, true, 'User profile retrieved successfully', { profile });
        }
        catch (error) {
            next(error);
        }
    }
    async updateOwnProfile(req, res, next) {
        try {
            const userId = req.user.userId;
            const updateData = req.body;
            const updatedProfile = await this.userProfileService.updateProfile(userId, updateData);
            (0, response_1.sendResponse)(res, 200, true, 'User profile updated successfully', { profile: updatedProfile });
        }
        catch (error) {
            next(error);
        }
    }
    async getProfile(req, res, next) {
        try {
            const userId = req.params.userId;
            const profile = await this.userProfileService.getProfile(userId);
            (0, response_1.sendResponse)(res, 200, true, 'User profile retrieved successfully', { profile });
        }
        catch (error) {
            if (error instanceof error_types_1.NotFoundError) {
                (0, response_1.sendResponse)(res, 404, false, error.message);
            }
            else {
                next(error);
            }
        }
    }
    async updateProfile(req, res, next) {
        try {
            const userId = req.params.userId;
            const updateData = req.body;
            const updatedProfile = await this.userProfileService.updateProfile(userId, updateData);
            (0, response_1.sendResponse)(res, 200, true, 'User profile updated successfully', { profile: updatedProfile });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UserProfileController = UserProfileController;
