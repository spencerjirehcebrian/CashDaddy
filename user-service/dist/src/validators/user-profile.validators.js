import { z } from 'zod';
const createProfileSchema = z.object({
    dateOfBirth: z.preprocess((arg) => {
        if (typeof arg === 'string') {
            const date = new Date(arg);
            return isNaN(date.getTime()) ? undefined : date;
        }
        return arg;
    }, z.date({
        errorMap: () => ({ message: 'Date of birth must be a valid date' })
    })),
    phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'),
    addressLine1: z.string().max(100, 'Address line 1 must not exceed 100 characters'),
    addressLine2: z.string().max(100, 'Address line 2 must not exceed 100 characters').optional(),
    city: z.string().max(50, 'City must not exceed 50 characters'),
    state: z.string().max(50, 'State must not exceed 50 characters'),
    country: z.string().max(50, 'Country must not exceed 50 characters'),
    postalCode: z.string().max(20, 'Postal code must not exceed 20 characters')
});
const updateProfileSchema = z
    .object({
    dateOfBirth: z.preprocess((arg) => {
        if (typeof arg === 'string') {
            const date = new Date(arg);
            return isNaN(date.getTime()) ? undefined : date;
        }
        return arg;
    }, z
        .date({
        errorMap: () => ({ message: 'Date of birth must be a valid date' })
    })
        .optional()),
    phoneNumber: z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number')
        .optional(),
    addressLine1: z.string().max(100, 'Address line 1 must not exceed 100 characters').optional(),
    addressLine2: z.string().max(100, 'Address line 2 must not exceed 100 characters').optional(),
    city: z.string().max(50, 'City must not exceed 50 characters').optional(),
    state: z.string().max(50, 'State must not exceed 50 characters').optional(),
    country: z.string().max(50, 'Country must not exceed 50 characters').optional(),
    postalCode: z.string().max(20, 'Postal code must not exceed 20 characters').optional()
})
    .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update'
});
export { createProfileSchema, updateProfileSchema };
