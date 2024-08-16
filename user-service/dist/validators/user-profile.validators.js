"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = exports.createProfileSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const createProfileSchema = joi_1.default.object().keys({
    dateOfBirth: joi_1.default.date().iso().required().messages({
        'date.base': 'Date of birth must be a valid date',
        'date.format': 'Date of birth must be in ISO format (YYYY-MM-DD)',
        'any.required': 'Date of birth is required'
    }),
    phoneNumber: joi_1.default.string()
        .required()
        .pattern(/^\+?[1-9]\d{1,14}$/)
        .messages({
        'string.base': 'Phone number must be a string',
        'string.pattern.base': 'Please enter a valid phone number',
        'string.empty': 'Phone number is required',
        'any.required': 'Phone number is required'
    }),
    addressLine1: joi_1.default.string().required().max(100).messages({
        'string.base': 'Address line 1 must be a string',
        'string.max': 'Address line 1 must not exceed 100 characters',
        'string.empty': 'Address line 1 is required',
        'any.required': 'Address line 1 is required'
    }),
    addressLine2: joi_1.default.string().optional().allow('').max(100).messages({
        'string.base': 'Address line 2 must be a string',
        'string.max': 'Address line 2 must not exceed 100 characters'
    }),
    city: joi_1.default.string().required().max(50).messages({
        'string.base': 'City must be a string',
        'string.max': 'City must not exceed 50 characters',
        'string.empty': 'City is required',
        'any.required': 'City is required'
    }),
    state: joi_1.default.string().required().max(50).messages({
        'string.base': 'State must be a string',
        'string.max': 'State must not exceed 50 characters',
        'string.empty': 'State is required',
        'any.required': 'State is required'
    }),
    country: joi_1.default.string().required().max(50).messages({
        'string.base': 'Country must be a string',
        'string.max': 'Country must not exceed 50 characters',
        'string.empty': 'Country is required',
        'any.required': 'Country is required'
    }),
    postalCode: joi_1.default.string().required().max(20).messages({
        'string.base': 'Postal code must be a string',
        'string.max': 'Postal code must not exceed 20 characters',
        'string.empty': 'Postal code is required',
        'any.required': 'Postal code is required'
    })
});
exports.createProfileSchema = createProfileSchema;
const updateProfileSchema = joi_1.default.object()
    .keys({
    dateOfBirth: joi_1.default.date().iso().messages({
        'date.base': 'Date of birth must be a valid date',
        'date.format': 'Date of birth must be in ISO format (YYYY-MM-DD)'
    }),
    phoneNumber: joi_1.default.string()
        .pattern(/^\+?[1-9]\d{1,14}$/)
        .messages({
        'string.base': 'Phone number must be a string',
        'string.pattern.base': 'Please enter a valid phone number'
    }),
    addressLine1: joi_1.default.string().max(100).messages({
        'string.base': 'Address line 1 must be a string',
        'string.max': 'Address line 1 must not exceed 100 characters'
    }),
    addressLine2: joi_1.default.string().allow('').max(100).messages({
        'string.base': 'Address line 2 must be a string',
        'string.max': 'Address line 2 must not exceed 100 characters'
    }),
    city: joi_1.default.string().max(50).messages({
        'string.base': 'City must be a string',
        'string.max': 'City must not exceed 50 characters'
    }),
    state: joi_1.default.string().max(50).messages({
        'string.base': 'State must be a string',
        'string.max': 'State must not exceed 50 characters'
    }),
    country: joi_1.default.string().max(50).messages({
        'string.base': 'Country must be a string',
        'string.max': 'Country must not exceed 50 characters'
    }),
    postalCode: joi_1.default.string().max(20).messages({
        'string.base': 'Postal code must be a string',
        'string.max': 'Postal code must not exceed 20 characters'
    })
})
    .min(1);
exports.updateProfileSchema = updateProfileSchema;
