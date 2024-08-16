import { IPaymentMethod, PaymentMethodType, PaymentProvider } from '../../interfaces/payment-method.interface';
import { PaymentMethod } from '../../models/payment-method.model';
import { NotFoundError } from '../../types/error.types';
import { Cacheable, CacheInvalidate } from '../../decorators/caching.decorator';
import { User } from '../../models/user.model';

export class PaymentMethodService {
  @CacheInvalidate({ keyPrefix: 'payment-methods' })
  static async addPaymentMethod(
    userId: string,
    methodType: PaymentMethodType,
    provider: PaymentProvider,
    tokenId: string,
    last4: string
  ): Promise<IPaymentMethod> {
    const paymentMethod = new PaymentMethod({
      user: userId,
      methodType,
      provider,
      tokenId,
      last4,
      isDefault: false
    });
    await paymentMethod.save();

    await User.findByIdAndUpdate(userId, { $push: { paymentMethods: paymentMethod._id } });
    return paymentMethod;
  }

  @Cacheable({ keyPrefix: 'payment-methods' })
  static async getPaymentMethods(userId: string): Promise<IPaymentMethod[]> {
    return PaymentMethod.find({ user: userId });
  }

  @CacheInvalidate({ keyPrefix: 'payment-methods' })
  static async updatePaymentMethod(paymentMethodId: string, userId: string, updateData: Partial<IPaymentMethod>): Promise<IPaymentMethod> {
    const paymentMethod = await PaymentMethod.findOne({ _id: paymentMethodId, user: userId });
    if (!paymentMethod) {
      throw new NotFoundError('Payment method not found');
    }

    Object.assign(paymentMethod, updateData);
    await paymentMethod.save();
    return paymentMethod;
  }

  @CacheInvalidate({ keyPrefix: 'payment-methods' })
  static async deletePaymentMethod(paymentMethodId: string, userId: string): Promise<void> {
    const result = await PaymentMethod.deleteOne({ _id: paymentMethodId, user: userId });
    if (result.deletedCount === 0) {
      throw new NotFoundError('Payment method not found');
    }
  }

  @CacheInvalidate({ keyPrefix: 'payment-methods' })
  static async setDefaultPaymentMethod(paymentMethodId: string, userId: string): Promise<IPaymentMethod> {
    const paymentMethod = await PaymentMethod.findOne({ _id: paymentMethodId, user: userId });
    if (!paymentMethod) {
      throw new NotFoundError('Payment method not found');
    }

    await PaymentMethod.updateMany({ user: userId }, { isDefault: false });
    paymentMethod.isDefault = true;
    await paymentMethod.save();
    return paymentMethod;
  }
}
