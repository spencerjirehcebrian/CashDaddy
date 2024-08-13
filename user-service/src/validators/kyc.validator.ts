import Joi from 'joi';
import { IdType, AddressProofType } from '../interfaces/models/kyc.interface';

export const kycSchema = Joi.object({
  idType: Joi.string()
    .valid(...Object.values(IdType))
    .required()
    .messages({
      'any.required': 'ID type is required',
      'any.only': 'Invalid ID type'
    }),
  idNumber: Joi.string()
    .required()
    .pattern(/^[A-Z0-9]{6,20}$/)
    .messages({
      'any.required': 'ID number is required',
      'string.empty': 'ID number cannot be empty',
      'string.pattern.base': 'ID number must be 6-20 alphanumeric characters'
    }),
  idExpiryDate: Joi.date().greater('now').required().messages({
    'any.required': 'ID expiry date is required',
    'date.greater': 'ID expiry date must be in the future'
  }),
  addressProofType: Joi.string()
    .valid(...Object.values(AddressProofType))
    .required()
    .messages({
      'any.required': 'Address proof type is required',
      'any.only': 'Invalid address proof type'
    }),
  addressProofDocument: Joi.string()
    .base64()
    .required()
    .max(5 * 1024 * 1024) // 5MB limit
    .messages({
      'any.required': 'Address proof document is required',
      'string.base64': 'Address proof document must be a valid base64 encoded string',
      'string.max': 'Address proof document must not exceed 5MB'
    })
}).options({ abortEarly: false });

export const rejectKycSchema = Joi.object({
  rejectionReason: Joi.string().required().min(10).max(500).messages({
    'any.required': 'Rejection reason is required',
    'string.min': 'Rejection reason must be at least 10 characters long',
    'string.max': 'Rejection reason must not exceed 500 characters'
  })
});
