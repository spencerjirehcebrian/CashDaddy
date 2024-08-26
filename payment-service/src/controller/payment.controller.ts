import { BadRequestError, CustomLogger, IWallet, sendResponse } from '@cash-daddy/shared';
import { Request, Response } from 'express';
import { Producer } from 'kafkajs';
import { IPaymentMethodService, IStripeService } from '../interfaces/index.js';

export class PaymentController {
  private userDataPromiseResolve: ((value: unknown) => void) | null = null;

  constructor(
    private paymentMethodService: IPaymentMethodService,
    private kafkaProducer: Producer,
    private stripeService: IStripeService
  ) {}

  handleReturnUser(userData: unknown): void {
    if (this.userDataPromiseResolve) {
      this.userDataPromiseResolve(userData);
      this.userDataPromiseResolve = null;
    } else {
      CustomLogger.warn('Received user data, but no pending KYC submission');
    }
  }
  async createPaymentMethod(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.user!;
      CustomLogger.info(`Received createPaymentMethod request for user ${userId}`);
      this.kafkaProducer.send({
        topic: 'wallet-events',
        messages: [
          {
            value: JSON.stringify({
              action: 'getWallet',
              payload: {
                userId
              }
            })
          }
        ]
      });

      const kafkaData: IWallet | null = await new Promise((resolve) => {
        this.userDataPromiseResolve = resolve as (value: unknown) => void;
        setTimeout(() => {
          if (this.userDataPromiseResolve) {
            this.userDataPromiseResolve(null);
            this.userDataPromiseResolve = null;
          }
        }, 10000);
      });
      const paymentMethod = await this.stripeService.attachPaymentMethodToCustomer(req.body.paymentMethodId, kafkaData!.stripeCustomerId);

      await this.stripeService.attachPaymentMethodToCustomer(paymentMethod.id, kafkaData!.stripeCustomerId);

      await this.paymentMethodService.createPaymentMethod(kafkaData!.user.toString(), paymentMethod.id, req.body.paymentMethodId);

      sendResponse(res, 200, true, 'Payment method created successfully', { paymentMethod });
    } catch (error) {
      CustomLogger.error('Error creating payment method:', error);
      if (error instanceof BadRequestError) {
        sendResponse(res, 400, false, error.message);
      } else {
        sendResponse(res, 500, false, (error as Error).message);
      }
    }
  }

  async getPaymentMethods(req: Request, res: Response): Promise<void> {
    try {
      this.kafkaProducer.send({
        topic: 'wallet-events',
        messages: [
          {
            value: JSON.stringify({
              action: 'getWallet',
              payload: {
                userId: req.user!.userId
              }
            })
          }
        ]
      });

      const kafkaData: IWallet | null = await new Promise((resolve) => {
        this.userDataPromiseResolve = resolve as (value: unknown) => void;
        setTimeout(() => {
          if (this.userDataPromiseResolve) {
            this.userDataPromiseResolve(null);
            this.userDataPromiseResolve = null;
          }
        }, 10000);
      });

      // const paymentMethodsStripe = await this.stripeService.listPaymentMethods(kafkaData!.stripeCustomerId);

      const paymentMethods = await this.paymentMethodService.getPaymentMethods(kafkaData!.user.toString());

      sendResponse(res, 200, true, 'Payment methods retrieved successfully', paymentMethods);
    } catch (error) {
      CustomLogger.error('Error getting payment methods:', error);
      sendResponse(res, 500, false, (error as Error).message);
    }
  }

  async deletePaymentMethod(req: Request, res: Response): Promise<void> {
    try {
      const { paymentMethodId } = req.params;

      const paymentMethod = await this.stripeService.detachPaymentMethod(paymentMethodId);

      await this.paymentMethodService.deletePaymentMethod(paymentMethodId);

      sendResponse(res, 200, true, 'Payment method deleted successfully', { paymentMethod });
    } catch (error) {
      CustomLogger.error('Error deleting payment method:', error);
      sendResponse(res, 500, false, (error as Error).message);
    }
  }

  async createPaymentIntent(req: Request, res: Response): Promise<void> {
    try {
      const { amount, paymentMethodId } = req.body;

      this.kafkaProducer.send({
        topic: 'wallet-events',
        messages: [
          {
            value: JSON.stringify({
              action: 'getWallet',
              payload: {
                userId: req.user!.userId
              }
            })
          }
        ]
      });

      const kafkaData: IWallet | null = await new Promise((resolve) => {
        this.userDataPromiseResolve = resolve as (value: unknown) => void;
        setTimeout(() => {
          if (this.userDataPromiseResolve) {
            this.userDataPromiseResolve(null);
            this.userDataPromiseResolve = null;
          }
        }, 10000);
      });
      const paymentIntent = await this.stripeService.createPaymentIntent(amount, 'usd', kafkaData!.stripeCustomerId, paymentMethodId);
      sendResponse(res, 200, true, 'Payment intent created successfully', { paymentIntent });
    } catch (error) {
      CustomLogger.error('Error creating payment intent:', error);
      sendResponse(res, 500, false, (error as Error).message);
    }
  }

  async confirmPaymentIntent(req: Request, res: Response): Promise<void> {
    try {
      const { paymentIntentId, paymentMethodId } = req.body;

      const paymentIntent = await this.stripeService.confirmPaymentIntent(paymentIntentId, paymentMethodId);

      sendResponse(res, 200, true, 'Payment intent confirmed successfully', { paymentIntent });
    } catch (error) {
      CustomLogger.error('Error confirming payment intent:', error);
      sendResponse(res, 500, false, (error as Error).message);
    }
  }

  async handleCreatePaymentIntentAuto(customerId: string, currency: string, paymentMethodId: string, amount: number): Promise<void> {
    CustomLogger.info('Handling createPaymentIntent event for customer:', customerId);

    const paymentIntent = await this.stripeService.createPaymentIntentAuto(amount, currency, customerId, paymentMethodId);

    this.kafkaProducer.send({
      topic: 'wallet-events',
      messages: [
        {
          value: JSON.stringify({
            action: 'returnWalletData',
            payload: paymentIntent
          })
        }
      ]
    });
  }

  async handleGetPaymentMethod(userId: string, paymentMethodId: string): Promise<void> {
    CustomLogger.info('Handling getPaymentMethods event for user:', userId);

    const paymentMethod = await this.stripeService.retrievePaymentMethod(paymentMethodId);

    this.kafkaProducer.send({
      topic: 'wallet-events',
      messages: [
        {
          value: JSON.stringify({
            action: 'returnWalletData',
            payload: paymentMethod
          })
        }
      ]
    });
  }

  async handleCreatePayout(customerId: string, amount: number): Promise<void> {
    CustomLogger.info('Handling createPayout event for customer:', customerId);

    const payout = await this.stripeService.createPayout(amount, customerId);

    this.kafkaProducer.send({
      topic: 'wallet-events',
      messages: [
        {
          value: JSON.stringify({
            action: 'returnWalletData',
            payload: payout
          })
        }
      ]
    });
  }
}
