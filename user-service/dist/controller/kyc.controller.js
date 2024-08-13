"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KYCController = void 0;
const response_1 = require("../utils/response");
const error_types_1 = require("../types/error.types");
const kafka_client_1 = require("../utils/kafka-client");
class KYCController {
    constructor(kycService) {
        this.kycService = kycService;
    }
    async submitOrUpdateKYC(req, res, next) {
        try {
            const userId = req.user.userId;
            const kycData = req.body;
            const kyc = await this.kycService.submitOrUpdateKYC(userId, kycData);
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
    async getKYCStatus(req, res, next) {
        try {
            const userId = req.params.userId;
            const kyc = await this.kycService.getKYCStatus(userId);
            (0, response_1.sendResponse)(res, 200, true, 'KYC status retrieved successfully', kyc);
        }
        catch (error) {
            next(error);
        }
    }
    async approveKYC(req, res, next) {
        try {
            const kycId = req.params.kycId;
            const { kyc, user } = await this.kycService.approveKYC(kycId);
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
    async rejectKYC(req, res, next) {
        try {
            const kycId = req.params.kycId;
            const { rejectionReason } = req.body;
            const updatedKYC = await this.kycService.rejectKYC(kycId, rejectionReason);
            (0, response_1.sendResponse)(res, 200, true, 'KYC rejected successfully', updatedKYC);
        }
        catch (error) {
            next(error);
        }
    }
    async getOwnKYCStatus(req, res, next) {
        try {
            const userId = req.user.userId;
            const kyc = await this.kycService.getKYCStatus(userId);
            (0, response_1.sendResponse)(res, 200, true, 'KYC status retrieved successfully', kyc);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.KYCController = KYCController;
