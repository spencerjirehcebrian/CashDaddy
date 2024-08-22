import { IKYCService } from '@/interfaces/index.js';
import { BadRequestError, NotFoundError, produceMessage, sendResponse } from '@cash-daddy/shared';
import { Request, Response, NextFunction } from 'express';

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
      const userId = req.params.userId;
      const { kyc } = await this.kycService.approveKYC(userId);

      // Send Kafka message
      await produceMessage('kyc-approved', { kyc });

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
      const userId = req.params.userId;
      const { rejectionReason } = req.body;
      const updatedKYC = await this.kycService.rejectKYC(userId, rejectionReason);
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
