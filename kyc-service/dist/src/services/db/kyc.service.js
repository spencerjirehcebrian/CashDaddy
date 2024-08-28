var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BadRequestError, NotFoundError } from '@cash-daddy/shared';
import { VerificationStatus } from '../../interfaces/index.js';
import { KnowYourCustomer } from '../../models/kyc.model.js';
import { Cacheable, CacheInvalidate } from '../../decorators/caching.decorator.js';
import { uploadToMinio } from '../minio/minio.service.js';
export class KYCService {
    async submitOrUpdateKYC(userId, kycData, addressProofFile) {
        // Upload file to MinIO
        let fileUrl;
        try {
            fileUrl = await uploadToMinio(addressProofFile);
        }
        catch {
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
    async getKYCStatus(userId) {
        const kyc = await KnowYourCustomer.findOne({ user: userId });
        if (!kyc) {
            throw new NotFoundError('KYC not found for this user');
        }
        return kyc;
    }
    async approveKYC(userId) {
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
    async rejectKYC(userId, rejectionReason) {
        if (!rejectionReason) {
            throw new BadRequestError('Rejection reason is required');
        }
        const kyc = await KnowYourCustomer.findOneAndUpdate({ user: userId }, {
            verificationStatus: VerificationStatus.REJECTED,
            rejectionReason
        }, { new: true, runValidators: true });
        if (!kyc) {
            throw new NotFoundError('KYC not found');
        }
        return kyc;
    }
}
__decorate([
    CacheInvalidate({ keyPrefix: 'kyc' }),
    CacheInvalidate({ keyPrefix: 'user' })
], KYCService.prototype, "submitOrUpdateKYC", null);
__decorate([
    Cacheable({ keyPrefix: 'kyc' })
], KYCService.prototype, "getKYCStatus", null);
__decorate([
    CacheInvalidate({ keyPrefix: 'kyc' }),
    CacheInvalidate({ keyPrefix: 'user' })
], KYCService.prototype, "approveKYC", null);
__decorate([
    CacheInvalidate({ keyPrefix: 'kyc' }),
    CacheInvalidate({ keyPrefix: 'user' })
], KYCService.prototype, "rejectKYC", null);
