import { Schema } from 'mongoose';
import { IUser } from './user.interface';

export enum PaymentMethodType {
  CREDIT_CARD = 'CREDIT_CARD',
  BANK_ACCOUNT = 'BANK_ACCOUNT'
}

export enum PaymentProvider {
  STRIPE = 'STRIPE'
}

export interface IPaymentMethod extends Document {
  user: Schema.Types.ObjectId | IUser;
  methodType: PaymentMethodType;
  provider: PaymentProvider;
  tokenId: string;
  last4: string;
  isDefault: boolean;
}
