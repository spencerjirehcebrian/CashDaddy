import { Request, Response, NextFunction } from 'express';
import { UserProfileService } from '../services/db/user-profile.service';
import { sendResponse } from '../utils/response';
import { AuthPayload } from '../types/auth.types';
import { NotFoundError } from '../types/error.types';

export class UserProfileController {
  static async createProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as AuthPayload;
      const { dateOfBirth, phoneNumber, addressLine1, addressLine2, city, state, country, postalCode } = req.body;

      const profile = await UserProfileService.createProfile(
        user.userId,
        new Date(dateOfBirth),
        phoneNumber,
        addressLine1,
        addressLine2,
        city,
        state,
        country,
        postalCode
      );
      sendResponse(res, 201, true, 'User profile created successfully', profile);
    } catch (error) {
      next(error);
    }
  }

  static async getOwnProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as AuthPayload;
      const profile = await UserProfileService.getProfile(user.userId);

      if (!profile) {
        throw new NotFoundError('Profile not found');
      }

      sendResponse(res, 200, true, 'User profile retrieved successfully', profile);
    } catch (error) {
      next(error);
    }
  }

  static async updateOwnProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as AuthPayload;
      const updateData = req.body;
      const updatedProfile = await UserProfileService.updateProfile(user.userId, updateData);
      sendResponse(res, 200, true, 'User profile updated successfully', updatedProfile);
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId;
      const profile = await UserProfileService.getProfile(userId);
      sendResponse(res, 200, true, 'User profile retrieved successfully', profile);
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId;
      const updateData = req.body;
      const updatedProfile = await UserProfileService.updateProfile(userId, updateData);
      sendResponse(res, 200, true, 'User profile updated successfully', updatedProfile);
    } catch (error) {
      next(error);
    }
  }
}
