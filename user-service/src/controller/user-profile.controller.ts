import { Request, Response, NextFunction } from 'express';
import { IUserProfileService } from '../interfaces/services/user-profile-service.interface.js';
import { Producer } from 'kafkajs';
import { AuthPayload, BadRequestError, NotFoundError, sendResponse } from '@cash-daddy/shared';

export class UserProfileController {
  constructor(
    private userProfileService: IUserProfileService,
    private kafkaProducer: Producer
  ) {}

  async createProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.user as AuthPayload).userId;
      const { dateOfBirth, phoneNumber, addressLine1, addressLine2, city, state, country, postalCode } = req.body;
      const profile = await this.userProfileService.createProfile(
        userId,
        dateOfBirth,
        phoneNumber,
        addressLine1,
        addressLine2,
        city,
        state,
        country,
        postalCode
      );
      sendResponse(res, 201, true, 'User profile created successfully', { profile });
    } catch (error) {
      if (error instanceof BadRequestError) {
        sendResponse(res, 400, false, error.message);
      } else {
        next(error);
      }
    }
  }

  async getOwnProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.user as AuthPayload).userId;
      const profile = await this.userProfileService.getProfile(userId);
      sendResponse(res, 200, true, 'User profile retrieved successfully', { profile });
    } catch (error) {
      next(error);
    }
  }

  async updateOwnProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.user as AuthPayload).userId;
      const updateData = req.body;
      const updatedProfile = await this.userProfileService.updateProfile(userId, updateData);
      sendResponse(res, 200, true, 'User profile updated successfully', { profile: updatedProfile });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId;
      const profile = await this.userProfileService.getProfile(userId);
      sendResponse(res, 200, true, 'User profile retrieved successfully', { profile });
    } catch (error) {
      if (error instanceof NotFoundError) {
        sendResponse(res, 404, false, error.message);
      } else {
        next(error);
      }
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId;
      const updateData = req.body;
      const updatedProfile = await this.userProfileService.updateProfile(userId, updateData);
      sendResponse(res, 200, true, 'User profile updated successfully', { profile: updatedProfile });
    } catch (error) {
      next(error);
    }
  }

  // Kakfa Actions
  async handleGetUserProfile(userId: string): Promise<void> {
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
