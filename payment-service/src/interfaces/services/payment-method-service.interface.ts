import { IPaymentMethod } from '../models/payment-method.interface.js';

export interface IPaymentMethodService {
  createPaymentMethod(
    userId: string,
    stripePaymentMethodId: string,
    type: string,
    cardDetails?: {
      brand: string;
      last4: string;
      expMonth: number;
      expYear: number;
    }
  ): Promise<IPaymentMethod>;
  deletePaymentMethod(paymentMethodId: string): Promise<void>;
  getPaymentMethods(userId: string): Promise<IPaymentMethod[]>;
  getPaymentMethod(userId: string, paymentMethodId: string): Promise<IPaymentMethod | null>;
}
