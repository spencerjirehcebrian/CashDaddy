import { z } from 'zod';
export var PaymentMethodType;
(function (PaymentMethodType) {
    PaymentMethodType["PM_CARD_VISA"] = "pm_card_visa";
    PaymentMethodType["PM_CARD_MASTERCARD"] = "pm_card_mastercard";
    PaymentMethodType["PM_CARD_AMEX"] = "pm_card_amex";
    PaymentMethodType["PM_CARD_DISCOVER"] = "pm_card_discover";
    PaymentMethodType["PM_CARD_DINERS"] = "pm_card_diners";
    PaymentMethodType["PM_CARD_JCB"] = "pm_card_jcb";
    PaymentMethodType["PM_CARD_UNIONPAY"] = "pm_card_unionpay";
    PaymentMethodType["PM_CARD_VISA_DEBIT"] = "pm_card_visa_debit";
    PaymentMethodType["PM_CARD_MASTERCARD_PREPAID"] = "pm_card_mastercard_prepaid";
    PaymentMethodType["PM_CARD_THREE_D_SECURE_2_REQUIRED"] = "pm_card_threeDSecure2Required";
    PaymentMethodType["PM_US_BANK_ACCOUNT"] = "pm_usBankAccount";
    PaymentMethodType["PM_SEPA_DEBIT"] = "pm_sepaDebit";
    PaymentMethodType["PM_BAC_DEBIT"] = "pm_bacsDebit";
    PaymentMethodType["PM_ALIPAY"] = "pm_alipay";
    PaymentMethodType["PM_WECHAT"] = "pm_wechat";
})(PaymentMethodType || (PaymentMethodType = {}));
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
    paymentMethodId: z.enum(Object.values(PaymentMethodType), {
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
