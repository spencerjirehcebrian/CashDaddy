import { IUser } from 'node_modules/@cash-daddy/shared/dist/interfaces/models/user.interface.js';
import { BadRequestError, CustomLogger, NotFoundError, sendResponse, VerificationStatus } from '@cash-daddy/shared';
import { Request, Response, NextFunction } from 'express';
import { IKYCService } from '../interfaces/index.js';
import { Producer } from 'kafkajs';

export class KYCController {
  private userDataPromiseResolve: ((value: unknown) => void) | null = null;

  constructor(
    private kycService: IKYCService,
    private kafkaProducer: Producer
  ) {}

  async submitOrUpdateKYC(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const kycData = req.body;
      CustomLogger.debug('Received KYC data:', kycData);
      const addressProofFile = req.file;
      CustomLogger.debug('Received address proof file:', addressProofFile);

      if (!addressProofFile) {
        throw new BadRequestError('Address proof document is required');
      }

      await this.kafkaProducer.send({
        topic: 'user-events',
        messages: [
          {
            value: JSON.stringify({
              action: 'getUser',
              payload: { userId }
            })
          }
        ]
      });

      const userData: IUser | null = await new Promise((resolve) => {
        this.userDataPromiseResolve = resolve as (value: unknown) => void;
        setTimeout(() => {
          if (this.userDataPromiseResolve) {
            this.userDataPromiseResolve(null);
            this.userDataPromiseResolve = null;
          }
        }, 10000);
      });

      if (!userData) {
        throw new NotFoundError('User cannot be verified');
      }

      if (!userData.userProfile) {
        throw new BadRequestError('Missing user profile data');
      }

      const kyc = await this.kycService.submitOrUpdateKYC(userId, kycData, addressProofFile);

      await this.kafkaProducer.send({
        topic: 'user-events',
        messages: [
          {
            value: JSON.stringify({
              action: 'updateUserKYC',
              payload: { userId: userData._id, kycId: kyc._id }
            })
          }
        ]
      });

      const userDataCheck: IUser | null = await new Promise((resolve) => {
        this.userDataPromiseResolve = resolve as (value: unknown) => void;
        setTimeout(() => {
          if (this.userDataPromiseResolve) {
            this.userDataPromiseResolve(null);
            this.userDataPromiseResolve = null;
          }
        }, 10000);
      });

      if (!userDataCheck) {
        throw new NotFoundError('User update cannot be verified');
      }

      sendResponse(res, 200, true, 'KYC submitted or updated successfully', kyc);
    } catch (error) {
      if (error instanceof BadRequestError) {
        sendResponse(res, 400, false, error.message);
      } else {
        next(error);
      }
    }
  }

  handleReturnUser(userData: unknown): void {
    if (this.userDataPromiseResolve) {
      this.userDataPromiseResolve(userData);
      this.userDataPromiseResolve = null;
    } else {
      CustomLogger.warn('Received user data, but no pending KYC submission');
    }
  }

  async handleGetOwnKYCAction(userId: string): Promise<void> {
    try {
      const kyc = await this.kycService.getKYCStatus(userId);
      await this.kafkaProducer.send({
        topic: 'user-events',
        messages: [
          {
            value: JSON.stringify({
              action: 'returnKYCData',
              payload: kyc
            })
          }
        ]
      });
      CustomLogger.info('KYC status retrieved successfully', kyc);
    } catch (error) {
      CustomLogger.error('Error retrieving KYC status', error);
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

      this.kafkaProducer.send({
        topic: 'notification-events',
        messages: [
          {
            value: JSON.stringify({
              action: 'triggerNotificationKYCUpdate',
              payload: { userId, kycStatus: VerificationStatus.APPROVED, rejectionReason: kyc?.rejectionReason }
            })
          }
        ]
      });
      sendResponse(res, 200, true, 'KYC approved successfully', kyc);
    } catch (error) {
      if (error instanceof BadRequestError) {
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

      this.kafkaProducer.send({
        topic: 'notification-events',
        messages: [
          {
            value: JSON.stringify({
              action: 'triggerNotificationKYCUpdate',
              payload: { userId, kycStatus: VerificationStatus.REJECTED, rejectionReason }
            })
          }
        ]
      });
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
