import Joi from 'joi';
import { PaymentMethodType, PaymentProvider } from '../interfaces/payment-method.interface';

export const paymentMethodSchema = Joi.object({
  methodType: Joi.string()
    .valid(...Object.values(PaymentMethodType))
    .required()
    .messages({
      'any.required': 'Payment method type is required',
      'any.only': 'Invalid payment method type'
    }),
  provider: Joi.string()
    .valid(...Object.values(PaymentProvider))
    .required()
    .messages({
      'any.required': 'Payment provider is required',
      'any.only': 'Invalid payment provider'
    }),
  tokenId: Joi.string().required().messages({
    'any.required': 'Token ID is required',
    'string.empty': 'Token ID cannot be empty'
  }),
  last4: Joi.string()
    .length(4)
    .pattern(/^[0-9]{4}$/)
    .required()
    .messages({
      'any.required': 'Last 4 digits are required',
      'string.length': 'Last 4 digits must be exactly 4 characters long',
      'string.pattern.base': 'Last 4 digits must be numeric'
    }),
  isDefault: Joi.boolean().default(false)
}).options({ abortEarly: false });

export const updatePaymentMethodSchema = Joi.object({
  methodType: Joi.string()
    .valid(...Object.values(PaymentMethodType))
    .messages({
      'any.required': 'Payment method type is required',
      'any.only': 'Invalid payment method type'
    }),
  provider: Joi.string()
    .valid(...Object.values(PaymentProvider))
    .messages({
      'any.required': 'Payment provider is required',
      'any.only': 'Invalid payment provider'
    }),
  tokenId: Joi.string().required().messages({
    'any.required': 'Token ID is required',
    'string.empty': 'Token ID cannot be empty'
  }),
  last4: Joi.string()
    .length(4)
    .pattern(/^[0-9]{4}$/)
    .messages({
      'any.required': 'Last 4 digits are required',
      'string.length': 'Last 4 digits must be exactly 4 characters long',
      'string.pattern.base': 'Last 4 digits must be numeric'
    }),
  isDefault: Joi.boolean().default(false)
}).options({ abortEarly: false });
