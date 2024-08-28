import { BadRequestError, NotFoundError, sendResponse } from '@cash-daddy/shared';
export class UserProfileController {
    constructor(userProfileService, kafkaProducer) {
        this.userProfileService = userProfileService;
        this.kafkaProducer = kafkaProducer;
    }
    async createProfile(req, res, next) {
        try {
            const userId = req.user.userId;
            const { dateOfBirth, phoneNumber, addressLine1, addressLine2, city, state, country, postalCode } = req.body;
            const profile = await this.userProfileService.createProfile(userId, dateOfBirth, phoneNumber, addressLine1, addressLine2, city, state, country, postalCode);
            sendResponse(res, 201, true, 'User profile created successfully', { profile });
        }
        catch (error) {
            if (error instanceof BadRequestError) {
                sendResponse(res, 400, false, error.message);
            }
            else {
                next(error);
            }
        }
    }
    async getOwnProfile(req, res, next) {
        try {
            const userId = req.user.userId;
            const profile = await this.userProfileService.getProfile(userId);
            sendResponse(res, 200, true, 'User profile retrieved successfully', { profile });
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
            sendResponse(res, 200, true, 'User profile updated successfully', { profile: updatedProfile });
        }
        catch (error) {
            next(error);
        }
    }
    async getProfile(req, res, next) {
        try {
            const userId = req.params.userId;
            const profile = await this.userProfileService.getProfile(userId);
            sendResponse(res, 200, true, 'User profile retrieved successfully', { profile });
        }
        catch (error) {
            if (error instanceof NotFoundError) {
                sendResponse(res, 404, false, error.message);
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
            sendResponse(res, 200, true, 'User profile updated successfully', { profile: updatedProfile });
        }
        catch (error) {
            next(error);
        }
    }
    // Kakfa Actions
    async handleGetUserProfile(userId) {
        const profile = await this.userProfileService.getProfile(userId);
        if (!profile) {
            throw new NotFoundError('User profile not found');
        }
        await this.kafkaProducer.send({
            topic: 'kyc-events',
            messages: [
                {
                    value: JSON.stringify({
                        action: 'returnUserProfile',
                        payload: profile
                    })
                }
            ]
        });
    }
}
