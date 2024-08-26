import { Types } from 'mongoose';

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  TRANSFER = 'TRANSFER'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface ITransaction extends Document {
  _id: Types.ObjectId;
  type: TransactionType;
  amount: number;
  currency: string;
  fromWallet?: Types.ObjectId;
  toWallet?: Types.ObjectId;
  status: TransactionStatus;
  stripePaymentIntentId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}
