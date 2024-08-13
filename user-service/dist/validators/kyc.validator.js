"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectKycSchema = exports.kycSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const kyc_interface_1 = require("../interfaces/models/kyc.interface");
exports.kycSchema = joi_1.default.object({
    idType: joi_1.default.string()
        .valid(...Object.values(kyc_interface_1.IdType))
        .required()
        .messages({
        'any.required': 'ID type is required',
        'any.only': 'Invalid ID type'
    }),
    idNumber: joi_1.default.string()
        .required()
        .pattern(/^[A-Z0-9]{6,20}$/)
        .messages({
        'any.required': 'ID number is required',
        'string.empty': 'ID number cannot be empty',
        'string.pattern.base': 'ID number must be 6-20 alphanumeric characters'
    }),
    idExpiryDate: joi_1.default.date().greater('now').required().messages({
        'any.required': 'ID expiry date is required',
        'date.greater': 'ID expiry date must be in the future'
    }),
    addressProofType: joi_1.default.string()
        .valid(...Object.values(kyc_interface_1.AddressProofType))
        .required()
        .messages({
        'any.required': 'Address proof type is required',
        'any.only': 'Invalid address proof type'
    }),
    addressProofDocument: joi_1.default.string()
        .base64()
        .required()
        .max(5 * 1024 * 1024) // 5MB limit
        .messages({
        'any.required': 'Address proof document is required',
        'string.base64': 'Address proof document must be a valid base64 encoded string',
        'string.max': 'Address proof document must not exceed 5MB'
    })
}).options({ abortEarly: false });
exports.rejectKycSchema = joi_1.default.object({
    rejectionReason: joi_1.default.string().required().min(10).max(500).messages({
        'any.required': 'Rejection reason is required',
        'string.min': 'Rejection reason must be at least 10 characters long',
        'string.max': 'Rejection reason must not exceed 500 characters'
    })
});
