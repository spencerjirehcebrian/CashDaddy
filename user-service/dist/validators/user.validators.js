"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reactivateUserSchema = exports.deactivateUserSchema = exports.updateUserSchema = exports.loginSchema = exports.registerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const registerSchema = joi_1.default.object().keys({
    email: joi_1.default.string().required().email().messages({
        'string.base': 'Email must be a string',
        'string.email': 'Please enter a valid email address',
        'string.empty': 'Email is required',
        'any.required': 'Email is required'
    }),
    password: joi_1.default.string().required().min(8).max(30).messages({
        'string.base': 'Password must be a string',
        'string.min': 'Password must be at least 8 characters long',
        'string.max': 'Password must not exceed 30 characters',
        'string.empty': 'Password is required',
        'any.required': 'Password is required'
    }),
    firstName: joi_1.default.string().required().min(2).max(50).messages({
        'string.base': 'First name must be a string',
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name must not exceed 50 characters',
        'string.empty': 'First name is required',
        'any.required': 'First name is required'
    }),
    lastName: joi_1.default.string().required().min(2).max(50).messages({
        'string.base': 'Last name must be a string',
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name must not exceed 50 characters',
        'string.empty': 'Last name is required',
        'any.required': 'Last name is required'
    })
});
exports.registerSchema = registerSchema;
const loginSchema = joi_1.default.object().keys({
    email: joi_1.default.string().required().email().messages({
        'string.base': 'Email must be a string',
        'string.email': 'Please enter a valid email address',
        'string.empty': 'Email is required',
        'any.required': 'Email is required'
    }),
    password: joi_1.default.string().required().messages({
        'string.base': 'Password must be a string',
        'string.empty': 'Password is required',
        'any.required': 'Password is required'
    })
});
exports.loginSchema = loginSchema;
const updateUserSchema = joi_1.default.object()
    .keys({
    firstName: joi_1.default.string().min(2).max(50).messages({
        'string.base': 'First name must be a string',
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name must not exceed 50 characters'
    }),
    lastName: joi_1.default.string().min(2).max(50).messages({
        'string.base': 'Last name must be a string',
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name must not exceed 50 characters'
    }),
    email: joi_1.default.string().email().messages({
        'string.base': 'Email must be a string',
        'string.email': 'Please enter a valid email address'
    })
})
    .min(1);
exports.updateUserSchema = updateUserSchema;
const deactivateUserSchema = joi_1.default.object().keys({
    confirmation: joi_1.default.string().valid('DEACTIVATE').required().messages({
        'any.only': 'Confirmation must be the word "DEACTIVATE"',
        'any.required': 'Confirmation is required'
    })
});
exports.deactivateUserSchema = deactivateUserSchema;
const reactivateUserSchema = joi_1.default.object().keys({
    confirmation: joi_1.default.string().valid('REACTIVATE').required().messages({
        'any.only': 'Confirmation must be the word "REACTIVATE"',
        'any.required': 'Confirmation is required'
    })
});
exports.reactivateUserSchema = reactivateUserSchema;
