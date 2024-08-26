import { BadRequestError, CustomLogger, NotFoundError } from '@cash-daddy/shared';
import { CacheInvalidate } from '../../decorators/caching.decorator.js';
import { IPaymentMethod, IPaymentMethodService } from '../../interfaces/index.js';
import { PaymentMethod } from '../../models/payment-method.model.js';
import mongoose from 'mongoose';
export class PaymentMethodService implements IPaymentMethodService {
  constructor() {}

  @CacheInvalidate({ keyPrefix: 'payment-method' })
  async createPaymentMethod(
    userId: string,
    stripePaymentMethodId: string,
    type: string,
    cardDetails?: {
      brand: string;
      last4: string;
      expMonth: number;
      expYear: number;
    }
  ): Promise<IPaymentMethod> {
    try {
      const existingPaymentMethod = await PaymentMethod.findOne({ stripePaymentMethodId });
      if (existingPaymentMethod) {
        throw new BadRequestError('Payment method already exists');
      }

      const newPaymentMethod = new PaymentMethod({
        user: new mongoose.Types.ObjectId(userId),
        stripePaymentMethodId,
        type,
        card: cardDetails,
        isDefault: false // You might want to make this configurable
      });

      await newPaymentMethod.save();

      CustomLogger.info(`Created payment method for user ${userId}: ${stripePaymentMethodId}`);
      return newPaymentMethod;
    } catch (error) {
      CustomLogger.error('Error in createPaymentMethod:', error);
      throw error;
    }
  }

  @CacheInvalidate({ keyPrefix: 'payment-method' })
  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      const paymentMethod = await PaymentMethod.findOne({
        stripePaymentMethodId: paymentMethodId
      });

      if (!paymentMethod) {
        throw new NotFoundError('Payment method not found');
      }

      // Delete from our database
      await PaymentMethod.deleteOne({ stripePaymentMethodId: paymentMethodId });
      CustomLogger.info(`Deleted payment method for user ${paymentMethodId}`);
    } catch (error) {
      CustomLogger.error('Error in deletePaymentMethod:', error);
      throw error;
    }
  }

  // @Cacheable({ keyPrefix: 'payment-method' })
  async getPaymentMethods(userId: string): Promise<IPaymentMethod[]> {
    try {
      const paymentMethods = await PaymentMethod.find({ user: userId }).sort({ createdAt: -1 });

      CustomLogger.info(`Retrieved ${paymentMethods.length} payment methods for user ${userId}`);
      return paymentMethods;
    } catch (error) {
      CustomLogger.error('Error in getPaymentMethods:', error);
      throw error;
    }
  }

  async getPaymentMethod(userId: string, paymentMethodId: string): Promise<IPaymentMethod | null> {
    try {
      const paymentMethod = await PaymentMethod.findOne({ user: userId, type: paymentMethodId });
      CustomLogger.info(`Retrieved payment method for user ${userId}: ${paymentMethodId}`);
      return paymentMethod;
    } catch (error) {
      CustomLogger.error('Error in getPaymentMethod:', error);
      throw error;
    }
  }
}
