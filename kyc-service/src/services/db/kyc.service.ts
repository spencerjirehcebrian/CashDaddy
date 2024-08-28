import { BadRequestError, NotFoundError } from '@cash-daddy/shared';
import { IKYC, IKYCService, VerificationStatus } from '../../interfaces/index.js';
import { KnowYourCustomer } from '../../models/kyc.model.js';
import { Cacheable, CacheInvalidate } from '../../decorators/caching.decorator.js';
import { uploadToMinio } from '../minio/minio.service.js';

export class KYCService implements IKYCService {
  @CacheInvalidate({ keyPrefix: 'kyc' })
  @CacheInvalidate({ keyPrefix: 'user' })
  async submitOrUpdateKYC(
    userId: string,
    kycData: Omit<IKYC, 'user' | 'verificationStatus' | 'addressProofDocument'>,
    addressProofFile: Express.Multer.File
  ): Promise<IKYC> {
    // Upload file to MinIO
    let fileUrl: string;
    try {
      fileUrl = await uploadToMinio(addressProofFile);
    } catch {
      throw new BadRequestError('Failed to upload address proof document.');
    }

    const existingKYC = await KnowYourCustomer.findOne({ user: userId });

    if (existingKYC) {
      if (existingKYC.verificationStatus === VerificationStatus.APPROVED) {
        throw new BadRequestError('Cannot update an approved KYC. Please contact support for assistance.');
      }

      Object.assign(existingKYC, kycData);
      existingKYC.addressProofDocument = fileUrl;
      existingKYC.verificationStatus = VerificationStatus.PENDING;
      existingKYC.rejectionReason = undefined;
      await existingKYC.save();
      return existingKYC;
    }

    const newKYC = new KnowYourCustomer({
      user: userId,
      ...kycData,
      addressProofDocument: fileUrl,
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
