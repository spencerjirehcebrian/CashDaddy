import { z } from 'zod';
import { UserRole } from '../interfaces/models/user.interface.js';
const validator = {
    validateUserRegistration(user) {
        const schema = z.object({
            email: z.string().email(),
            password: z.string().min(8),
            firstName: z.string().min(2).max(50),
            lastName: z.string().min(2).max(50),
            role: z.enum(Object.values(UserRole)).default(UserRole.USER)
        });
        return schema.safeParse(user);
    },
    validateLogin(data) {
        const schema = z.object({
            email: z.string().email(),
            password: z.string()
        });
        return schema.safeParse(data);
    },
    validateUserUpdate(data) {
        const schema = z
            .object({
            email: z.string().email().optional(),
            firstName: z.string().min(2).max(50).optional(),
            lastName: z.string().min(2).max(50).optional(),
            role: z.enum(Object.values(UserRole)).optional()
        })
            .strict()
            .refine((data) => Object.keys(data).length > 0, {
            message: 'At least one field must be provided for update'
        });
        return schema.safeParse(data);
    },
    validateUserProfile(profile) {
        const schema = z.object({
            user: z.string(),
            dateOfBirth: z.date().optional(),
            address: z.string().optional(),
            phoneNumber: z.string().optional()
        });
        return schema.safeParse(profile);
    },
    validateKYC(kyc) {
        const schema = z.object({
            user: z.string(),
            idType: z.string(),
            idNumber: z.string(),
            verificationStatus: z.enum(['pending', 'approved', 'rejected']).default('pending')
        });
        return schema.safeParse(kyc);
    },
    validatePaymentMethod(paymentMethod) {
        const schema = z.object({
            user: z.string(),
            type: z.enum(['credit_card', 'bank_account']),
            details: z.record(z.unknown()),
            isDefault: z.boolean().default(false)
        });
        return schema.safeParse(paymentMethod);
    },
    validateId(id) {
        return z.string().safeParse(id);
    },
    validateEmail(email) {
        return z.string().email().safeParse(email);
    }
};
export { validator };
