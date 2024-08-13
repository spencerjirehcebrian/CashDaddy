import { Request, Response, NextFunction } from 'express';
import { IUserProfileService } from '../interfaces/services/user-profile-service.interface';
import { sendResponse } from '../utils/response';
import { NotFoundError } from '../types/error.types';
import { AuthPayload } from '../types/auth.types';

export class UserProfileController {
  constructor(private userProfileService: IUserProfileService) {}

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
      next(error);
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
}
