import { Request, Response, NextFunction } from 'express';
import { IUserService } from '../interfaces/services/user-service.interface.js';
import { IAuthService } from '../interfaces/services/auth-service.interface.js';
import { Producer } from 'kafkajs';
import { User } from '../models/user.model.js';
import { Types } from 'mongoose';
import { IRedisService } from '../interfaces/services/redis.service.interface.js';
import { AuthPayload, BadRequestError, CustomLogger, IKYC, NotFoundError, sendResponse, VerificationStatus } from '@cash-daddy/shared';

export class UserController {
  private kafkaDataPromiseResolve: ((value: unknown) => void) | null = null;

  constructor(
    private userService: IUserService,
    private authService: IAuthService,
    private redisService: IRedisService,
    private kafkaProducer: Producer
  ) {}

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, firstName, lastName } = req.body;
      const user = await this.userService.register(email, password, firstName, lastName);
      sendResponse(res, 201, true, 'User registered successfully', { user });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const authPayload = await this.userService.login(email, password);

      const { userId, email: userEmail, role, status } = authPayload;

      const user = await User.findById(userId);

      if (user?.kyc) {
        await this.kafkaProducer.send({
          topic: 'kyc-events',
          messages: [
            {
              value: JSON.stringify({
                action: 'getOwnKYC',
                payload: {
                  userId: authPayload.userId
                }
              })
            }
          ]
        });

        const kafkaDataCheck: IKYC | null = await new Promise((resolve) => {
          this.kafkaDataPromiseResolve = resolve as (value: unknown) => void;
          setTimeout(() => {
            if (this.kafkaDataPromiseResolve) {
              this.kafkaDataPromiseResolve(null);
              this.kafkaDataPromiseResolve = null;
            }
          }, 10000);
        });

        if (!kafkaDataCheck) {
          next(new Error('KYC not found'));
        }

        const newAuthPayload = {
          userId,
          email: userEmail,
          role,
          status,
          verificationStatus: kafkaDataCheck?.verificationStatus
        };

        const token = this.authService.generateToken(newAuthPayload);
        sendResponse(res, 200, true, 'Login successful', { token, user: newAuthPayload });
      } else {
        const newAuthPayload = {
          userId,
          email: userEmail,
          role,
          status,
          verificationStatus: VerificationStatus.NOT_SUBMITTED
        };

        const token = this.authService.generateToken(newAuthPayload);
        sendResponse(res, 200, true, 'Login successful', { token, user: newAuthPayload });
      }
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (token) {
        await this.redisService.addToBlacklist(token);
      }
      sendResponse(res, 200, true, 'Logout successful');
    } catch (error) {
      next(error);
    }
  }

  async getOwnUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.user as AuthPayload).userId;
      const user = await this.userService.getUserById(userId);
      sendResponse(res, 200, true, 'User retrieved successfully', user);
    } catch (error) {
      next(error);
    }
  }

  async updateOwnUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.user as AuthPayload).userId;
      const updateData = req.body;
      const updatedUser = await this.userService.updateUser(userId, updateData);
      sendResponse(res, 200, true, 'User updated successfully', updatedUser);
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await this.userService.getAllUsers();
      sendResponse(res, 200, true, 'Users retrieved successfully', users);
    } catch (error) {
      next(error);
    }
  }

  async getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId;
      const user = await this.userService.getUserById(userId);
      sendResponse(res, 200, true, 'User retrieved successfully', user);
    } catch (error) {
      if (error instanceof NotFoundError) {
        sendResponse(res, 404, false, error.message);
      } else {
        next(error);
      }
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId;
      const updateData = req.body;
      const updatedUser = await this.userService.updateUser(userId, updateData);
      sendResponse(res, 200, true, 'User updated successfully', updatedUser);
    } catch (error) {
      next(error);
    }
  }

  async deactivateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId;
      const deactivatedUser = await this.userService.deactivateUser(userId);
      sendResponse(res, 200, true, 'User deactivated successfully', { user: deactivatedUser });
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        sendResponse(res, 400, false, error.message);
      } else {
        next(error);
      }
    }
  }

  async reactivateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId;
      const reactivatedUser = await this.userService.reactivateUser(userId);
      sendResponse(res, 200, true, 'User reactivated successfully', { user: reactivatedUser });
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        sendResponse(res, 400, false, error.message);
      } else {
        next(error);
      }
    }
  }

  async promoteUserToAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId;
      const promotedUser = await this.userService.promoteUserToAdmin(userId);
      sendResponse(res, 200, true, 'User promoted successfully', { user: promotedUser });
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        sendResponse(res, 400, false, error.message);
      } else {
        next(error);
      }
    }
  }

  // Kakfa Actions
  async handleGetUser(userId: string): Promise<void> {
    CustomLogger.info('Handling getUser event for user:', userId);
    const user = await User.findById(userId).populate('userProfile').exec();
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await this.kafkaProducer.send({
      topic: 'kyc-events',
      messages: [
        {
          value: JSON.stringify({
            action: 'returnUser',
            payload: user
          })
        }
      ]
    });
  }
  async handleGetUserWallet(userId: string): Promise<void> {
    CustomLogger.info('Handling getUser event for user:', userId);
    const user = await User.findById(userId).populate('userProfile').exec();
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await this.kafkaProducer.send({
      topic: 'kyc-events',
      messages: [
        {
          value: JSON.stringify({
            action: 'returnUser',
            payload: user
          })
        }
      ]
    });
  }
  async handleUpdateUserKYC(userId: string, kycId: string): Promise<void> {
    CustomLogger.info('Handling updateUserKYC event for user:', userId);
    const updatedUser = await this.userService.updateUser(userId, { kyc: new Types.ObjectId(kycId) });
    if (!updatedUser.kyc) {
      throw new NotFoundError('KYC not found');
    }
    await this.kafkaProducer.send({
      topic: 'kyc-events',
      messages: [
        {
          value: JSON.stringify({
            action: 'returnUser',
            payload: updatedUser
          })
        }
      ]
    });
  }
  async handleUpdateUserStripeCustomer(userId: string, stripeCustomerId: string): Promise<void> {
    CustomLogger.info('Handling updateUserStripeCustomer event for user:', userId);
    const updatedUser = await this.userService.updateUser(userId, { stripeCustomerId });
    if (!updatedUser.stripeCustomerId) {
      throw new NotFoundError('Stripe customer not updated');
    }
    const user = await User.findById(userId).populate('userProfile').exec();
    CustomLogger.info('Stripe customer updated for user:', user?.stripeCustomerId);
    await this.kafkaProducer.send({
      topic: 'wallet-events',
      messages: [
        {
          value: JSON.stringify({
            action: 'returnUser',
            payload: user
          })
        }
      ]
    });
  }

  handleReturnKafkaData(kafkaData: unknown): void {
    if (this.kafkaDataPromiseResolve) {
      this.kafkaDataPromiseResolve(kafkaData);
      this.kafkaDataPromiseResolve = null;
    } else {
      CustomLogger.warn('Received data from Kafka but no promise was found');
    }
  }
}
