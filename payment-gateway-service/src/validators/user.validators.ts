import Joi, { ObjectSchema } from 'joi';

const registerSchema: ObjectSchema = Joi.object().keys({
  email: Joi.string().required().email().messages({
    'string.base': 'Email must be a string',
    'string.email': 'Please enter a valid email address',
    'string.empty': 'Email is required',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().min(8).max(30).messages({
    'string.base': 'Password must be a string',
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password must not exceed 30 characters',
    'string.empty': 'Password is required',
    'any.required': 'Password is required'
  }),
  firstName: Joi.string().required().min(2).max(50).messages({
    'string.base': 'First name must be a string',
    'string.min': 'First name must be at least 2 characters long',
    'string.max': 'First name must not exceed 50 characters',
    'string.empty': 'First name is required',
    'any.required': 'First name is required'
  }),
  lastName: Joi.string().required().min(2).max(50).messages({
    'string.base': 'Last name must be a string',
    'string.min': 'Last name must be at least 2 characters long',
    'string.max': 'Last name must not exceed 50 characters',
    'string.empty': 'Last name is required',
    'any.required': 'Last name is required'
  })
});

const loginSchema: ObjectSchema = Joi.object().keys({
  email: Joi.string().required().email().messages({
    'string.base': 'Email must be a string',
    'string.email': 'Please enter a valid email address',
    'string.empty': 'Email is required',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'string.base': 'Password must be a string',
    'string.empty': 'Password is required',
    'any.required': 'Password is required'
  })
});

const updateUserSchema: ObjectSchema = Joi.object()
  .keys({
    firstName: Joi.string().min(2).max(50).messages({
      'string.base': 'First name must be a string',
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name must not exceed 50 characters'
    }),
    lastName: Joi.string().min(2).max(50).messages({
      'string.base': 'Last name must be a string',
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name must not exceed 50 characters'
    }),
    email: Joi.string().email().messages({
      'string.base': 'Email must be a string',
      'string.email': 'Please enter a valid email address'
    })
  })
  .min(1);

const deactivateUserSchema: ObjectSchema = Joi.object().keys({
  confirmation: Joi.string().valid('DEACTIVATE').required().messages({
    'any.only': 'Confirmation must be the word "DEACTIVATE"',
    'any.required': 'Confirmation is required'
  })
});

const reactivateUserSchema: ObjectSchema = Joi.object().keys({
  confirmation: Joi.string().valid('REACTIVATE').required().messages({
    'any.only': 'Confirmation must be the word "REACTIVATE"',
    'any.required': 'Confirmation is required'
  })
});

export { registerSchema, loginSchema, updateUserSchema, deactivateUserSchema, reactivateUserSchema };
