"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KYCService = void 0;
const kyc_interface_1 = require("../../interfaces/kyc.interface");
const kyc_model_1 = require("../../models/kyc.model");
const error_types_1 = require("../../types/error.types");
class KYCService {
    static async submitKYC(userId, idType, idNumber) {
        const existingKYC = await kyc_model_1.KnowYourCustomer.findOne({ user: userId });
        if (existingKYC) {
            throw new error_types_1.BadRequestError('KYC already submitted for this user');
        }
        const kyc = new kyc_model_1.KnowYourCustomer({
            user: userId,
            idType,
            idNumber,
            verificationStatus: kyc_interface_1.verificationStatus.PENDING
        });
        await kyc.save();
        return kyc;
    }
    static async getKYCStatus(userId) {
        const kyc = await kyc_model_1.KnowYourCustomer.findOne({ user: userId });
        if (!kyc) {
            throw new error_types_1.NotFoundError('KYC not found for this user');
        }
        return kyc;
    }
    static async updateKYCStatus(kycId, status) {
        const kyc = await kyc_model_1.KnowYourCustomer.findByIdAndUpdate(kycId, { verificationStatus: status }, { new: true, runValidators: true });
        if (!kyc) {
            throw new error_types_1.NotFoundError('KYC not found');
        }
        return kyc;
    }
}
exports.KYCService = KYCService;
