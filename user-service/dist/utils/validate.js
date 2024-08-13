"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validator = void 0;
const joi_1 = __importDefault(require("joi"));
const user_interface_1 = require("../interfaces/models/user.interface");
const validator = {
    validateUserRegistration(user) {
        const schema = joi_1.default.object({
            email: joi_1.default.string().email().required(),
            password: joi_1.default.string().min(8).required(),
            firstName: joi_1.default.string().min(2).max(50).required(),
            lastName: joi_1.default.string().min(2).max(50).required(),
            role: joi_1.default.string()
                .valid(...Object.values(user_interface_1.UserRole))
                .default(user_interface_1.UserRole.USER)
        });
        return schema.validate(user);
    },
    validateLogin(data) {
        const schema = joi_1.default.object({
            email: joi_1.default.string().email().required(),
            password: joi_1.default.string().required()
        });
        return schema.validate(data);
    },
    validateUserUpdate(data) {
        const schema = joi_1.default.object({
            email: joi_1.default.string().email(),
            firstName: joi_1.default.string().min(2).max(50),
            lastName: joi_1.default.string().min(2).max(50),
            role: joi_1.default.string().valid(...Object.values(user_interface_1.UserRole))
        }).min(1);
        return schema.validate(data);
    },
    validateUserProfile(profile) {
        const schema = joi_1.default.object({
            user: joi_1.default.string().required(),
            dateOfBirth: joi_1.default.date(),
            address: joi_1.default.string(),
            phoneNumber: joi_1.default.string()
        });
        return schema.validate(profile);
    },
    validateKYC(kyc) {
        const schema = joi_1.default.object({
            user: joi_1.default.string().required(),
            idType: joi_1.default.string().required(),
            idNumber: joi_1.default.string().required(),
            verificationStatus: joi_1.default.string().valid('pending', 'approved', 'rejected').default('pending')
        });
        return schema.validate(kyc);
    },
    validatePaymentMethod(paymentMethod) {
        const schema = joi_1.default.object({
            user: joi_1.default.string().required(),
            type: joi_1.default.string().valid('credit_card', 'bank_account').required(),
            details: joi_1.default.object().required(),
            isDefault: joi_1.default.boolean().default(false)
        });
        return schema.validate(paymentMethod);
    },
    validateId(id) {
        return joi_1.default.string().required().validate(id);
    },
    validateEmail(email) {
        return joi_1.default.string().email().required().validate(email);
    }
};
exports.validator = validator;
