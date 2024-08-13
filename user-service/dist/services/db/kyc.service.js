"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KYCService = void 0;
const kyc_interface_1 = require("../../interfaces/models/kyc.interface");
const kyc_model_1 = require("../../models/kyc.model");
const error_types_1 = require("../../types/error.types");
const caching_decorator_1 = require("../../decorators/caching.decorator");
const user_profile_model_1 = require("../../models/user-profile.model");
const user_model_1 = require("../../models/user.model");
class KYCService {
    async submitOrUpdateKYC(userId, kycData) {
        // Check if user profile exists
        const userProfile = await user_profile_model_1.UserProfile.findOne({ user: userId });
        if (!userProfile) {
            throw new error_types_1.BadRequestError('User profile not found. Please complete your profile before submitting KYC.');
        }
        const existingKYC = await kyc_model_1.KnowYourCustomer.findOne({ user: userId });
        if (existingKYC) {
            if (existingKYC.verificationStatus === kyc_interface_1.VerificationStatus.APPROVED) {
                throw new error_types_1.BadRequestError('Cannot update an approved KYC. Please contact support for assistance.');
            }
            Object.assign(existingKYC, kycData);
            existingKYC.verificationStatus = kyc_interface_1.VerificationStatus.PENDING;
            existingKYC.rejectionReason = undefined;
            await existingKYC.save();
            return existingKYC;
        }
        const newKYC = new kyc_model_1.KnowYourCustomer({
            user: userId,
            ...kycData,
            verificationStatus: kyc_interface_1.VerificationStatus.PENDING
        });
        await newKYC.save();
        await user_model_1.User.findByIdAndUpdate(userId, { kyc: newKYC._id });
        return newKYC;
    }
    async getKYCStatus(userId) {
        const kyc = await kyc_model_1.KnowYourCustomer.findOne({ user: userId });
        if (!kyc) {
            throw new error_types_1.NotFoundError('KYC not found for this user');
        }
        return kyc;
    }
    async approveKYC(kycId) {
        const kyc = await kyc_model_1.KnowYourCustomer.findById(kycId);
        if (!kyc) {
            throw new error_types_1.NotFoundError('KYC not found');
        }
        if (kyc.verificationStatus === kyc_interface_1.VerificationStatus.APPROVED) {
            throw new error_types_1.BadRequestError('KYC is already approved');
        }
        const userProfile = await user_profile_model_1.UserProfile.findOne({ user: kyc.user });
        if (!userProfile) {
            throw new error_types_1.BadRequestError('User profile not found. KYC approval requires a completed user profile.');
        }
        const user = await user_model_1.User.findById(kyc.user);
        if (!user) {
            throw new error_types_1.NotFoundError('User not found');
        }
        kyc.verificationStatus = kyc_interface_1.VerificationStatus.APPROVED;
        await kyc.save();
        return { kyc, user };
    }
    async rejectKYC(kycId, rejectionReason) {
        if (!rejectionReason) {
            throw new error_types_1.BadRequestError('Rejection reason is required');
        }
        const kyc = await kyc_model_1.KnowYourCustomer.findByIdAndUpdate(kycId, {
            verificationStatus: kyc_interface_1.VerificationStatus.REJECTED,
            rejectionReason
        }, { new: true, runValidators: true });
        if (!kyc) {
            throw new error_types_1.NotFoundError('KYC not found');
        }
        return kyc;
    }
}
exports.KYCService = KYCService;
__decorate([
    (0, caching_decorator_1.CacheInvalidate)({ keyPrefix: 'kyc' })
], KYCService.prototype, "submitOrUpdateKYC", null);
__decorate([
    (0, caching_decorator_1.Cacheable)({ keyPrefix: 'kyc' })
], KYCService.prototype, "getKYCStatus", null);
__decorate([
    (0, caching_decorator_1.CacheInvalidate)({ keyPrefix: 'kyc' })
], KYCService.prototype, "approveKYC", null);
__decorate([
    (0, caching_decorator_1.CacheInvalidate)({ keyPrefix: 'kyc' })
], KYCService.prototype, "rejectKYC", null);
