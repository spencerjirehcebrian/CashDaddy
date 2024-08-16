"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentMethodService = void 0;
const payment_method_model_1 = require("../../models/payment-method.model");
const error_types_1 = require("../../types/error.types");
const caching_decorator_1 = require("../../decorators/caching.decorator");
const user_model_1 = require("../../models/user.model");
class PaymentMethodService {
    static async addPaymentMethod(userId, methodType, provider, tokenId, last4) {
        const paymentMethod = new payment_method_model_1.PaymentMethod({
            user: userId,
            methodType,
            provider,
            tokenId,
            last4,
            isDefault: false
        });
        await paymentMethod.save();
        await user_model_1.User.findByIdAndUpdate(userId, { $push: { paymentMethods: paymentMethod._id } });
        return paymentMethod;
    }
    static async getPaymentMethods(userId) {
        return payment_method_model_1.PaymentMethod.find({ user: userId });
    }
    static async updatePaymentMethod(paymentMethodId, userId, updateData) {
        const paymentMethod = await payment_method_model_1.PaymentMethod.findOne({ _id: paymentMethodId, user: userId });
        if (!paymentMethod) {
            throw new error_types_1.NotFoundError('Payment method not found');
        }
        Object.assign(paymentMethod, updateData);
        await paymentMethod.save();
        return paymentMethod;
    }
    static async deletePaymentMethod(paymentMethodId, userId) {
        const result = await payment_method_model_1.PaymentMethod.deleteOne({ _id: paymentMethodId, user: userId });
        if (result.deletedCount === 0) {
            throw new error_types_1.NotFoundError('Payment method not found');
        }
    }
    static async setDefaultPaymentMethod(paymentMethodId, userId) {
        const paymentMethod = await payment_method_model_1.PaymentMethod.findOne({ _id: paymentMethodId, user: userId });
        if (!paymentMethod) {
            throw new error_types_1.NotFoundError('Payment method not found');
        }
        await payment_method_model_1.PaymentMethod.updateMany({ user: userId }, { isDefault: false });
        paymentMethod.isDefault = true;
        await paymentMethod.save();
        return paymentMethod;
    }
}
exports.PaymentMethodService = PaymentMethodService;
__decorate([
    (0, caching_decorator_1.CacheInvalidate)({ keyPrefix: 'payment-methods' })
], PaymentMethodService, "addPaymentMethod", null);
__decorate([
    (0, caching_decorator_1.Cacheable)({ keyPrefix: 'payment-methods' })
], PaymentMethodService, "getPaymentMethods", null);
__decorate([
    (0, caching_decorator_1.CacheInvalidate)({ keyPrefix: 'payment-methods' })
], PaymentMethodService, "updatePaymentMethod", null);
__decorate([
    (0, caching_decorator_1.CacheInvalidate)({ keyPrefix: 'payment-methods' })
], PaymentMethodService, "deletePaymentMethod", null);
__decorate([
    (0, caching_decorator_1.CacheInvalidate)({ keyPrefix: 'payment-methods' })
], PaymentMethodService, "setDefaultPaymentMethod", null);
