"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentMethodService = void 0;
const payment_method_model_1 = require("../../models/payment-method.model");
const error_types_1 = require("../../types/error.types");
class PaymentMethodService {
    static async addPaymentMethod(userId, type, details) {
        const paymentMethod = new payment_method_model_1.PaymentMethod({
            user: userId,
            type,
            details
        });
        await paymentMethod.save();
        return paymentMethod;
    }
    static async getPaymentMethods(userId) {
        return payment_method_model_1.PaymentMethod.find({ user: userId });
    }
    static async updatePaymentMethod(paymentMethodId, updateData) {
        const paymentMethod = await payment_method_model_1.PaymentMethod.findByIdAndUpdate(paymentMethodId, updateData, { new: true, runValidators: true });
        if (!paymentMethod) {
            throw new error_types_1.NotFoundError('Payment method not found');
        }
        return paymentMethod;
    }
    static async deletePaymentMethod(paymentMethodId) {
        const result = await payment_method_model_1.PaymentMethod.deleteOne({ _id: paymentMethodId });
        if (result.deletedCount === 0) {
            throw new error_types_1.NotFoundError('Payment method not found');
        }
    }
}
exports.PaymentMethodService = PaymentMethodService;
