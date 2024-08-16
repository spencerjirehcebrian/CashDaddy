import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long').max(30, 'Password must not exceed 30 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters long').max(50, 'First name must not exceed 50 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters long').max(50, 'Last name must not exceed 50 characters')
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
});

const updateUserSchema = z
  .object({
    firstName: z
      .string()
      .min(2, 'First name must be at least 2 characters long')
      .max(50, 'First name must not exceed 50 characters')
      .optional(),
    lastName: z
      .string()
      .min(2, 'Last name must be at least 2 characters long')
      .max(50, 'Last name must not exceed 50 characters')
      .optional(),
    email: z.string().email('Please enter a valid email address').optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update'
  });

const deactivateUserSchema = z.object({
  confirmation: z.literal('DEACTIVATE', {
    errorMap: () => ({ message: 'Confirmation must be the word "DEACTIVATE"' })
  })
});

const reactivateUserSchema = z.object({
  confirmation: z.literal('REACTIVATE', {
    errorMap: () => ({ message: 'Confirmation must be the word "REACTIVATE"' })
  })
});

export { registerSchema, loginSchema, updateUserSchema, deactivateUserSchema, reactivateUserSchema };
