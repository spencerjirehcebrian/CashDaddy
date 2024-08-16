"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KYCController = void 0;
const kyc_service_1 = require("../services/db/kyc.service");
const response_1 = require("../utils/response");
const error_types_1 = require("../types/error.types");
const kafka_client_1 = require("../utils/kafka-client");
class KYCController {
    static async submitOrUpdateKYC(req, res, next) {
        try {
            const userId = req.user.userId;
            const kycData = req.body;
            const kyc = await kyc_service_1.KYCService.submitOrUpdateKYC(userId, kycData);
            (0, response_1.sendResponse)(res, 200, true, 'KYC submitted or updated successfully', kyc);
        }
        catch (error) {
            if (error instanceof error_types_1.BadRequestError) {
                (0, response_1.sendResponse)(res, 400, false, error.message);
            }
            else {
                next(error);
            }
        }
    }
    static async getKYCStatus(req, res, next) {
        try {
            const userId = req.params.userId;
            const kyc = await kyc_service_1.KYCService.getKYCStatus(userId);
            (0, response_1.sendResponse)(res, 200, true, 'KYC status retrieved successfully', kyc);
        }
        catch (error) {
            next(error);
        }
    }
    static async approveKYC(req, res, next) {
        try {
            const kycId = req.params.kycId;
            const { kyc, user } = await kyc_service_1.KYCService.approveKYC(kycId);
            // Send Kafka message
            await (0, kafka_client_1.produceMessage)('kyc-approved', { kyc, user });
            (0, response_1.sendResponse)(res, 200, true, 'KYC approved successfully', kyc);
        }
        catch (error) {
            if (error instanceof error_types_1.NotFoundError) {
                (0, response_1.sendResponse)(res, 404, false, error.message);
            }
            else if (error instanceof error_types_1.BadRequestError) {
                (0, response_1.sendResponse)(res, 400, false, error.message);
            }
            else {
                next(error);
            }
        }
    }
    static async rejectKYC(req, res, next) {
        try {
            const kycId = req.params.kycId;
            const { rejectionReason } = req.body;
            const updatedKYC = await kyc_service_1.KYCService.rejectKYC(kycId, rejectionReason);
            (0, response_1.sendResponse)(res, 200, true, 'KYC rejected successfully', updatedKYC);
        }
        catch (error) {
            next(error);
        }
    }
    static async getOwnKYCStatus(req, res, next) {
        try {
            const userId = req.user.userId;
            const kyc = await kyc_service_1.KYCService.getKYCStatus(userId);
            (0, response_1.sendResponse)(res, 200, true, 'KYC status retrieved successfully', kyc);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.KYCController = KYCController;
