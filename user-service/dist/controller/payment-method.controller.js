"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentMethodController = void 0;
const payment_method_service_1 = require("../services/db/payment-method.service");
const response_1 = require("../utils/response");
class PaymentMethodController {
    static async addPaymentMethod(req, res, next) {
        try {
            const userId = req.user.userId;
            const { methodType, provider, tokenId, last4 } = req.body;
            const paymentMethod = await payment_method_service_1.PaymentMethodService.addPaymentMethod(userId, methodType, provider, tokenId, last4);
            (0, response_1.sendResponse)(res, 201, true, 'Payment method added successfully', paymentMethod);
        }
        catch (error) {
            next(error);
        }
    }
    static async getPaymentMethods(req, res, next) {
        try {
            const userId = req.user.userId;
            const paymentMethods = await payment_method_service_1.PaymentMethodService.getPaymentMethods(userId);
            (0, response_1.sendResponse)(res, 200, true, 'Payment methods retrieved successfully', paymentMethods);
        }
        catch (error) {
            next(error);
        }
    }
    static async updatePaymentMethod(req, res, next) {
        try {
            const { paymentMethodId } = req.params;
            const userId = req.user.userId;
            const updateData = req.body;
            const updatedPaymentMethod = await payment_method_service_1.PaymentMethodService.updatePaymentMethod(paymentMethodId, userId, updateData);
            (0, response_1.sendResponse)(res, 200, true, 'Payment method updated successfully', updatedPaymentMethod);
        }
        catch (error) {
            next(error);
        }
    }
    static async deletePaymentMethod(req, res, next) {
        try {
            const { paymentMethodId } = req.params;
            const userId = req.user.userId;
            await payment_method_service_1.PaymentMethodService.deletePaymentMethod(paymentMethodId, userId);
            (0, response_1.sendResponse)(res, 200, true, 'Payment method deleted successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async setDefaultPaymentMethod(req, res, next) {
        try {
            const { paymentMethodId } = req.params;
            const userId = req.user.userId;
            const updatedPaymentMethod = await payment_method_service_1.PaymentMethodService.setDefaultPaymentMethod(paymentMethodId, userId);
            (0, response_1.sendResponse)(res, 200, true, 'Default payment method set successfully', updatedPaymentMethod);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PaymentMethodController = PaymentMethodController;
