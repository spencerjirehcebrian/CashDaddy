var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BadRequestError, CustomLogger, NotFoundError } from '@cash-daddy/shared';
import { CacheInvalidate } from '../../decorators/caching.decorator.js';
import { PaymentMethod } from '../../models/payment-method.model.js';
import mongoose from 'mongoose';
export class PaymentMethodService {
    constructor() { }
    async createPaymentMethod(userId, stripePaymentMethodId, type, cardDetails) {
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
        }
        catch (error) {
            CustomLogger.error('Error in createPaymentMethod:', error);
            throw error;
        }
    }
    async deletePaymentMethod(paymentMethodId) {
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
        }
        catch (error) {
            CustomLogger.error('Error in deletePaymentMethod:', error);
            throw error;
        }
    }
    // @Cacheable({ keyPrefix: 'payment-method' })
    async getPaymentMethods(userId) {
        try {
            const paymentMethods = await PaymentMethod.find({ user: userId }).sort({ createdAt: -1 });
            CustomLogger.info(`Retrieved ${paymentMethods.length} payment methods for user ${userId}`);
            return paymentMethods;
        }
        catch (error) {
            CustomLogger.error('Error in getPaymentMethods:', error);
            throw error;
        }
    }
    async getPaymentMethod(userId, paymentMethodId) {
        try {
            const paymentMethod = await PaymentMethod.findOne({ user: userId, type: paymentMethodId });
            CustomLogger.info(`Retrieved payment method for user ${userId}: ${paymentMethodId}`);
            return paymentMethod;
        }
        catch (error) {
            CustomLogger.error('Error in getPaymentMethod:', error);
            throw error;
        }
    }
}
__decorate([
    CacheInvalidate({ keyPrefix: 'payment-method' })
], PaymentMethodService.prototype, "createPaymentMethod", null);
__decorate([
    CacheInvalidate({ keyPrefix: 'payment-method' })
], PaymentMethodService.prototype, "deletePaymentMethod", null);
