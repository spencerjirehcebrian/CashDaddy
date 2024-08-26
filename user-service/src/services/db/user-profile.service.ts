import { IUserProfile } from '../../interfaces/models/user-profile.interface.js';
import { UserProfile } from '../../models/user-profile.model.js';
import { User } from '../../models/user.model.js';
import { IUserProfileService } from '../../interfaces/services/user-profile-service.interface.js';
import { Cacheable, CacheInvalidate } from '../../decorators/caching.decorator.js';
import { BadRequestError, NotFoundError } from '@cash-daddy/shared';

export class UserProfileService implements IUserProfileService {
  @CacheInvalidate({ keyPrefix: 'user-profile' })
  @CacheInvalidate({ keyPrefix: 'user' })
  async createProfile(
    userId: string,
    dateOfBirth: Date,
    phoneNumber: string,
    addressLine1: string,
    addressLine2: string | undefined,
    city: string,
    state: string,
    country: string,
    postalCode: string
  ): Promise<IUserProfile> {
    // Check if a profile already exists for the user
    const existingProfile = await UserProfile.findOne({ user: userId });
    if (existingProfile) {
      throw new BadRequestError('User profile already exists');
    }

    const profile = new UserProfile({
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
    await User.findByIdAndUpdate(userId, { userProfile: profile._id });
    return profile;
  }

  @Cacheable({ keyPrefix: 'user-profile' })
  async getProfile(userId: string): Promise<IUserProfile> {
    const profile = await UserProfile.findOne({ user: userId });
    if (!profile) {
      throw new NotFoundError('User profile not found');
    }
    return profile;
  }

  @CacheInvalidate({ keyPrefix: 'user-profile' })
  @CacheInvalidate({ keyPrefix: 'user' })
  async updateProfile(userId: string, updateData: Partial<IUserProfile>): Promise<IUserProfile> {
    const profile = await UserProfile.findOneAndUpdate({ user: userId }, updateData, { new: true, runValidators: true });
    if (!profile) {
      throw new NotFoundError('User profile not found');
    }
    return profile;
  }
}
