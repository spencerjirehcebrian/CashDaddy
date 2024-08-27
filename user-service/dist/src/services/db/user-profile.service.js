var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { UserProfile } from '../../models/user-profile.model.js';
import { User } from '../../models/user.model.js';
import { Cacheable, CacheInvalidate } from '../../decorators/caching.decorator.js';
import { BadRequestError, NotFoundError } from '@cash-daddy/shared';
export class UserProfileService {
    async createProfile(userId, dateOfBirth, phoneNumber, addressLine1, addressLine2, city, state, country, postalCode) {
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
    async getProfile(userId) {
        const profile = await UserProfile.findOne({ user: userId });
        if (!profile) {
            throw new NotFoundError('User profile not found');
        }
        return profile;
    }
    async updateProfile(userId, updateData) {
        const profile = await UserProfile.findOneAndUpdate({ user: userId }, updateData, { new: true, runValidators: true });
        if (!profile) {
            throw new NotFoundError('User profile not found');
        }
        return profile;
    }
}
__decorate([
    CacheInvalidate({ keyPrefix: 'user-profile' }),
    CacheInvalidate({ keyPrefix: 'user' })
], UserProfileService.prototype, "createProfile", null);
__decorate([
    Cacheable({ keyPrefix: 'user-profile' })
], UserProfileService.prototype, "getProfile", null);
__decorate([
    CacheInvalidate({ keyPrefix: 'user-profile' }),
    CacheInvalidate({ keyPrefix: 'user' })
], UserProfileService.prototype, "updateProfile", null);
