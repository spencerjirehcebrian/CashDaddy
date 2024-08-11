"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePaymentMethodSchema = exports.paymentMethodSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const payment_method_interface_1 = require("../interfaces/payment-method.interface");
exports.paymentMethodSchema = joi_1.default.object({
    methodType: joi_1.default.string()
        .valid(...Object.values(payment_method_interface_1.PaymentMethodType))
        .required()
        .messages({
        'any.required': 'Payment method type is required',
        'any.only': 'Invalid payment method type'
    }),
    provider: joi_1.default.string()
        .valid(...Object.values(payment_method_interface_1.PaymentProvider))
        .required()
        .messages({
        'any.required': 'Payment provider is required',
        'any.only': 'Invalid payment provider'
    }),
    tokenId: joi_1.default.string().required().messages({
        'any.required': 'Token ID is required',
        'string.empty': 'Token ID cannot be empty'
    }),
    last4: joi_1.default.string()
        .length(4)
        .pattern(/^[0-9]{4}$/)
        .required()
        .messages({
        'any.required': 'Last 4 digits are required',
        'string.length': 'Last 4 digits must be exactly 4 characters long',
        'string.pattern.base': 'Last 4 digits must be numeric'
    }),
    isDefault: joi_1.default.boolean().default(false)
}).options({ abortEarly: false });
exports.updatePaymentMethodSchema = joi_1.default.object({
    methodType: joi_1.default.string()
        .valid(...Object.values(payment_method_interface_1.PaymentMethodType))
        .messages({
        'any.required': 'Payment method type is required',
        'any.only': 'Invalid payment method type'
    }),
    provider: joi_1.default.string()
        .valid(...Object.values(payment_method_interface_1.PaymentProvider))
        .messages({
        'any.required': 'Payment provider is required',
        'any.only': 'Invalid payment provider'
    }),
    tokenId: joi_1.default.string().required().messages({
        'any.required': 'Token ID is required',
        'string.empty': 'Token ID cannot be empty'
    }),
    last4: joi_1.default.string()
        .length(4)
        .pattern(/^[0-9]{4}$/)
        .messages({
        'any.required': 'Last 4 digits are required',
        'string.length': 'Last 4 digits must be exactly 4 characters long',
        'string.pattern.base': 'Last 4 digits must be numeric'
    }),
    isDefault: joi_1.default.boolean().default(false)
}).options({ abortEarly: false });
