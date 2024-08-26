import { IUser } from 'node_modules/@cash-daddy/shared/dist/interfaces/models/user.interface.js';
import { BadRequestError, CustomLogger, NotFoundError, sendResponse } from '@cash-daddy/shared';
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
        throw new BadRequestError('UserProfile data is missing in the payload');
      }

      const kyc = await this.kycService.submitOrUpdateKYC(userId, kycData);

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
      // await this.createStripeCustomer(userId);
      sendResponse(res, 200, true, 'KYC approved successfully', kyc);
    } catch (error) {
      if (error instanceof BadRequestError) {
        sendResponse(res, 400, false, error.message);
      } else {
        next(error);
      }
    }
  }

  // private async createStripeCustomer(userId: string) {
  //   try {
  //     const kycStatus = await this.kycService.getKYCStatus(userId);

  //     if (kycStatus.verificationStatus !== VerificationStatus.APPROVED) {
  //       throw new Error('User has not completed KYC process');
  //     }

  //     await this.kafkaProducer.send({
  //       topic: 'user-events',
  //       messages: [
  //         {
  //           value: JSON.stringify({
  //             action: 'getUser',
  //             payload: { userId }
  //           })
  //         }
  //       ]
  //     });

  //     const userData: IUser | null = await new Promise((resolve) => {
  //       this.userDataPromiseResolve = resolve as (value: unknown) => void;
  //       setTimeout(() => {
  //         if (this.userDataPromiseResolve) {
  //           this.userDataPromiseResolve(null);
  //           this.userDataPromiseResolve = null;
  //         }
  //       }, 10000);
  //     });

  //     if (!userData) {
  //       throw new NotFoundError('User cannot be verified');
  //     }

  //     // Create a new customer in Stripe
  //     const customerData: Stripe.CustomerCreateParams = {
  //       email: userData.email,
  //       name: `${userData.firstName} ${userData.lastName}`.trim(),
  //       address: {
  //         line1: userData.userProfile.addressLine1,
  //         ...(userData.userProfile.addressLine2 && { line2: userData.userProfile.addressLine2 }),
  //         city: userData.userProfile.city,
  //         state: userData.userProfile.state,
  //         postal_code: userData.userProfile.postalCode,
  //         country: userData.userProfile.country
  //       },
  //       metadata: { userId: userData.id }
  //     };

  //     const customer = await this.stripe.customers.create(customerData);

  //     await this.kafkaProducer.send({
  //       topic: 'user-events',
  //       messages: [
  //         {
  //           value: JSON.stringify({
  //             action: 'updateUserStripeCustomer',
  //             payload: { userId, stripeCustomerId: customer.id }
  //           })
  //         }
  //       ]
  //     });

  //     const userDataCheck: IUser | null = await new Promise((resolve) => {
  //       this.userDataPromiseResolve = resolve as (value: unknown) => void;
  //       setTimeout(() => {
  //         if (this.userDataPromiseResolve) {
  //           this.userDataPromiseResolve(null);
  //           this.userDataPromiseResolve = null;
  //         }
  //       }, 10000);
  //     });

  //     if (!userDataCheck) {
  //       throw new NotFoundError('User update cannot be verified');
  //     }

  //     CustomLogger.info(`Stripe customer created for user ${userId} with ID ${customer.id}`);

  //     return customer;
  //   } catch (error) {
  //     CustomLogger.error('Error creating Stripe customer', error);
  //     throw error;
  //   }
  // }

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
