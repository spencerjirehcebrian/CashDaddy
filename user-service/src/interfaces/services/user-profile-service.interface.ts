import { IUserProfile } from '../models/user-profile.interface.js';

export interface IUserProfileService {
  createProfile(
    userId: string,
    dateOfBirth: Date,
    phoneNumber: string,
    addressLine1: string,
    addressLine2: string | undefined,
    city: string,
    state: string,
    country: string,
    postalCode: string
  ): Promise<IUserProfile>;

  getProfile(userId: string): Promise<IUserProfile>;

  updateProfile(userId: string, updateData: Partial<IUserProfile>): Promise<IUserProfile>;
}
