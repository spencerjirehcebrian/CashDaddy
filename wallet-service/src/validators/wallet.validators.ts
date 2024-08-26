import { z } from 'zod';

export enum PaymentMethodType {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_ACCOUNT = 'bank_account'
}

export const createWalletSchema = z.object({
  initialBalance: z.number().min(0, 'Initial balance must be non-negative')
});

export const depositSchema = z.object({
  amount: z.number().positive('Deposit amount must be positive'),
  paymentMethodId: z.string().min(1, 'Payment method ID is required')
});

export const withdrawSchema = z.object({
  amount: z.number().positive('Withdrawal amount must be positive')
});

export const transferSchema = z.object({
  toUserId: z.string().min(1, 'Recipient user ID is required'),
  amount: z.number().positive('Transfer amount must be positive')
});

export const addPaymentMethodSchema = z.object({
  type: z.enum(Object.values(PaymentMethodType) as [string, ...string[]], {
    errorMap: () => ({ message: 'Invalid payment method type' })
  }),
  token: z.string().min(1, 'Payment method token is required')
});

export const createPaymentIntentSchema = z.object({
  amount: z.number().positive('Payment amount must be positive')
});

export const confirmPaymentIntentSchema = z.object({
  paymentIntentId: z.string().min(1, 'Payment intent ID is required'),
  paymentMethodId: z.string().min(1, 'Payment method ID is required')
});

export const generateQRSchema = z.object({
  amount: z.number().positive('QR payment amount must be positive')
});

export const initiateQRPaymentSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID is required'),
  paymentMethodId: z.string().min(1, 'Payment method ID is required')
});

export const confirmQRPaymentSchema = z.object({
  paymentIntentId: z.string().min(1, 'Payment intent ID is required'),
  paymentMethodId: z.string().min(1, 'Payment method ID is required')
});
