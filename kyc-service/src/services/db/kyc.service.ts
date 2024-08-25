import { BadRequestError, NotFoundError } from '@cash-daddy/shared';
import { IKYC, IKYCService, VerificationStatus } from '../../interfaces/index.js';
import { KnowYourCustomer } from '../../models/kyc.model.js';
import { Cacheable, CacheInvalidate } from '../../decorators/caching.decorator.js';

export class KYCService implements IKYCService {
  @CacheInvalidate({ keyPrefix: 'kyc' })
  @CacheInvalidate({ keyPrefix: 'user' })
  async submitOrUpdateKYC(userId: string, kycData: Omit<IKYC, 'user' | 'verificationStatus'>): Promise<IKYC> {
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
    return newKYC;
  }

  @Cacheable({ keyPrefix: 'kyc' })
  async getKYCStatus(userId: string): Promise<IKYC> {
    const kyc = await KnowYourCustomer.findOne({ user: userId });
    if (!kyc) {
      throw new NotFoundError('KYC not found for this user');
    }
    return kyc;
  }

  @CacheInvalidate({ keyPrefix: 'kyc' })
  @CacheInvalidate({ keyPrefix: 'user' })
  async approveKYC(userId: string): Promise<{ kyc: IKYC }> {
    const kyc = await KnowYourCustomer.findOne({ user: userId });
    if (!kyc) {
      throw new NotFoundError('KYC not found');
    }

    if (kyc.verificationStatus === VerificationStatus.APPROVED) {
      throw new BadRequestError('KYC is already approved');
    }

    // const userProfile = await UserProfile.findOne({ user: kyc.user });
    // if (!userProfile) {
    //   throw new BadRequestError('User profile not found. KYC approval requires a completed user profile.');
    // }

    // const user = await User.findById(kyc.user);
    // if (!user) {
    //   throw new NotFoundError('User not found');
    // }

    kyc.verificationStatus = VerificationStatus.APPROVED;
    kyc.rejectionReason = undefined;
    await kyc.save();

    return { kyc };
  }

  @CacheInvalidate({ keyPrefix: 'kyc' })
  @CacheInvalidate({ keyPrefix: 'user' })
  async rejectKYC(userId: string, rejectionReason: string): Promise<IKYC> {
    if (!rejectionReason) {
      throw new BadRequestError('Rejection reason is required');
    }

    const kyc = await KnowYourCustomer.findOneAndUpdate(
      { user: userId },
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
