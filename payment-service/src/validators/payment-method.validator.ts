import { z } from 'zod';

export enum PaymentMethodType {
  PM_CARD_VISA = 'pm_card_visa',
  PM_CARD_MASTERCARD = 'pm_card_mastercard',
  PM_CARD_AMEX = 'pm_card_amex',
  PM_CARD_DISCOVER = 'pm_card_discover',
  PM_CARD_DINERS = 'pm_card_diners',
  PM_CARD_JCB = 'pm_card_jcb',
  PM_CARD_UNIONPAY = 'pm_card_unionpay',
  PM_CARD_VISA_DEBIT = 'pm_card_visa_debit',
  PM_CARD_MASTERCARD_PREPAID = 'pm_card_mastercard_prepaid',
  PM_CARD_THREE_D_SECURE_2_REQUIRED = 'pm_card_threeDSecure2Required',
  PM_US_BANK_ACCOUNT = 'pm_usBankAccount',
  PM_SEPA_DEBIT = 'pm_sepaDebit',
  PM_BAC_DEBIT = 'pm_bacsDebit',
  PM_ALIPAY = 'pm_alipay',
  PM_WECHAT = 'pm_wechat'
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
  paymentMethodId: z.enum(Object.values(PaymentMethodType) as [string, ...string[]], {
    errorMap: () => ({ message: 'Invalid payment method type' })
  })
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
