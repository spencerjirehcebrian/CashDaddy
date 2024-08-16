import { Cacheable, CacheInvalidate } from '../../decorators/caching.decorator';
import { IUserProfile } from '../../interfaces/user-profile.interface';
import { UserProfile } from '../../models/user-profile.model';
import { User } from '../../models/user.model';
import { NotFoundError } from '../../types/error.types';

export class UserProfileService {
  @CacheInvalidate({ keyPrefix: 'user-profile' })
  static async createProfile(
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
  static async getProfile(userId: string): Promise<IUserProfile> {
    const profile = await UserProfile.findOne({ user: userId });
    if (!profile) {
      throw new NotFoundError('User profile not found');
    }
    return profile;
  }

  @CacheInvalidate({ keyPrefix: 'user-profile' })
  static async updateProfile(userId: string, updateData: Partial<IUserProfile>): Promise<IUserProfile> {
    const profile = await UserProfile.findOneAndUpdate({ user: userId }, updateData, { new: true, runValidators: true });
    if (!profile) {
      throw new NotFoundError('User profile not found');
    }
    return profile;
  }
}
