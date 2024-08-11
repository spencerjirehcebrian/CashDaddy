import { IKYC, VerificationStatus } from '../../interfaces/kyc.interface';
import { KnowYourCustomer } from '../../models/kyc.model';
import { BadRequestError, NotFoundError } from '../../types/error.types';
import { Cacheable, CacheInvalidate } from '../../decorators/caching.decorator';
import { UserProfile } from '../../models/user-profile.model';
import { IUser } from '../../interfaces/user.interface';
import { User } from '../../models/user.model';

export class KYCService {
  @CacheInvalidate({ keyPrefix: 'kyc' })
  static async submitOrUpdateKYC(userId: string, kycData: Omit<IKYC, 'user' | 'verificationStatus'>): Promise<IKYC> {
    // Check if user profile exists
    const userProfile = await UserProfile.findOne({ user: userId });
    if (!userProfile) {
      throw new BadRequestError('User profile not found. Please complete your profile before submitting KYC.');
    }

    const existingKYC = await KnowYourCustomer.findOne({ user: userId });

    if (existingKYC) {
      if (existingKYC.verificationStatus === VerificationStatus.APPROVED) {
        throw new BadRequestError('Cannot update an approved KYC. Please contact support for assistance.');
      }

      Object.assign(existingKYC, kycData);
      existingKYC.verificationStatus = VerificationStatus.PENDING;
      existingKYC.rejectionReason = undefined;
      await existingKYC.save();
      return existingKYC;
    }

    const newKYC = new KnowYourCustomer({
      user: userId,
      ...kycData,
      verificationStatus: VerificationStatus.PENDING
    });
    await newKYC.save();

    await User.findByIdAndUpdate(userId, { kyc: newKYC._id });

    return newKYC;
  }

  @Cacheable({ keyPrefix: 'kyc' })
  static async getKYCStatus(userId: string): Promise<IKYC> {
    const kyc = await KnowYourCustomer.findOne({ user: userId });
    if (!kyc) {
      throw new NotFoundError('KYC not found for this user');
    }
    return kyc;
  }

  @CacheInvalidate({ keyPrefix: 'kyc' })
  static async approveKYC(kycId: string): Promise<{ kyc: IKYC; user: IUser }> {
    const kyc = await KnowYourCustomer.findById(kycId);
    if (!kyc) {
      throw new NotFoundError('KYC not found');
    }

    if (kyc.verificationStatus === VerificationStatus.APPROVED) {
      throw new BadRequestError('KYC is already approved');
    }

    const userProfile = await UserProfile.findOne({ user: kyc.user });
    if (!userProfile) {
      throw new BadRequestError('User profile not found. KYC approval requires a completed user profile.');
    }

    const user = await User.findById(kyc.user);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    kyc.verificationStatus = VerificationStatus.APPROVED;
    await kyc.save();

    return { kyc, user };
  }
  @CacheInvalidate({ keyPrefix: 'kyc' })
  static async rejectKYC(kycId: string, rejectionReason: string): Promise<IKYC> {
    if (!rejectionReason) {
      throw new BadRequestError('Rejection reason is required');
    }

    const kyc = await KnowYourCustomer.findByIdAndUpdate(
      kycId,
      {
        verificationStatus: VerificationStatus.REJECTED,
        rejectionReason
      },
      { new: true, runValidators: true }
    );
    if (!kyc) {
      throw new NotFoundError('KYC not found');
    }
    return kyc;
  }
}