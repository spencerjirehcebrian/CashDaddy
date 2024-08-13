import Joi, { ValidationResult } from 'joi';
import { UserRole } from '../interfaces/models/user.interface';

const validator = {
  validateUserRegistration(user: Record<string, unknown>): ValidationResult {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
      firstName: Joi.string().min(2).max(50).required(),
      lastName: Joi.string().min(2).max(50).required(),
      role: Joi.string()
        .valid(...Object.values(UserRole))
        .default(UserRole.USER)
    });
    return schema.validate(user);
  },

  validateLogin(data: Record<string, unknown>): ValidationResult {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    });
    return schema.validate(data);
  },

  validateUserUpdate(data: Record<string, unknown>): ValidationResult {
    const schema = Joi.object({
      email: Joi.string().email(),
      firstName: Joi.string().min(2).max(50),
      lastName: Joi.string().min(2).max(50),
      role: Joi.string().valid(...Object.values(UserRole))
    }).min(1);
    return schema.validate(data);
  },

  validateUserProfile(profile: Record<string, unknown>): ValidationResult {
    const schema = Joi.object({
      user: Joi.string().required(),
      dateOfBirth: Joi.date(),
      address: Joi.string(),
      phoneNumber: Joi.string()
    });
    return schema.validate(profile);
  },

  validateKYC(kyc: Record<string, unknown>): ValidationResult {
    const schema = Joi.object({
      user: Joi.string().required(),
      idType: Joi.string().required(),
      idNumber: Joi.string().required(),
      verificationStatus: Joi.string().valid('pending', 'approved', 'rejected').default('pending')
    });
    return schema.validate(kyc);
  },

  validatePaymentMethod(paymentMethod: Record<string, unknown>): ValidationResult {
    const schema = Joi.object({
      user: Joi.string().required(),
      type: Joi.string().valid('credit_card', 'bank_account').required(),
      details: Joi.object().required(),
      isDefault: Joi.boolean().default(false)
    });
    return schema.validate(paymentMethod);
  },

  validateId(id: string): ValidationResult {
    return Joi.string().required().validate(id);
  },

  validateEmail(email: string): ValidationResult {
    return Joi.string().email().required().validate(email);
  }
};

export { validator };
