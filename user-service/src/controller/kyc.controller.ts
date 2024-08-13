import { Request, Response, NextFunction } from 'express';
import { IKYCService } from '../interfaces/services/kyc-service.interface';
import { sendResponse } from '../utils/response';
import { BadRequestError, NotFoundError } from '../types/error.types';
import { produceMessage } from '../utils/kafka-client';

export class KYCController {
  constructor(private kycService: IKYCService) {}

  async submitOrUpdateKYC(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const kycData = req.body;
      const kyc = await this.kycService.submitOrUpdateKYC(userId, kycData);
      sendResponse(res, 200, true, 'KYC submitted or updated successfully', kyc);
    } catch (error) {
      if (error instanceof BadRequestError) {
        sendResponse(res, 400, false, error.message);
      } else {
        next(error);
      }
    }
  }

  async getKYCStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId;
      const kyc = await this.kycService.getKYCStatus(userId);
      sendResponse(res, 200, true, 'KYC status retrieved successfully', kyc);
    } catch (error) {
      next(error);
    }
  }

  async approveKYC(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kycId = req.params.kycId;
      const { kyc, user } = await this.kycService.approveKYC(kycId);

      // Send Kafka message
      await produceMessage('kyc-approved', { kyc, user });

      sendResponse(res, 200, true, 'KYC approved successfully', kyc);
    } catch (error) {
      if (error instanceof NotFoundError) {
        sendResponse(res, 404, false, error.message);
      } else if (error instanceof BadRequestError) {
        sendResponse(res, 400, false, error.message);
      } else {
        next(error);
      }
    }
  }

  async rejectKYC(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kycId = req.params.kycId;
      const { rejectionReason } = req.body;
      const updatedKYC = await this.kycService.rejectKYC(kycId, rejectionReason);
      sendResponse(res, 200, true, 'KYC rejected successfully', updatedKYC);
    } catch (error) {
      next(error);
    }
  }

  async getOwnKYCStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const kyc = await this.kycService.getKYCStatus(userId);
      sendResponse(res, 200, true, 'KYC status retrieved successfully', kyc);
    } catch (error) {
      next(error);
    }
  }
}