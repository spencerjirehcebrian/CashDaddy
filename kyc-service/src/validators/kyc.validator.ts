import { AddressProofType, IdType } from '@/interfaces/models/kyc.interface.js';
import { z } from 'zod';

export const kycSchema = z.object({
  idType: z.enum(Object.values(IdType) as [string, ...string[]], {
    errorMap: () => ({ message: 'Invalid ID type' })
  }),
  idNumber: z.string().regex(/^[A-Z0-9]{6,20}$/, 'ID number must be 6-20 alphanumeric characters'),
  idExpiryDate: z.preprocess(
    (arg) => {
      // Convert string to Date object if it's a valid date string
      return typeof arg === 'string' ? new Date(arg) : arg;
    },
    z.date().min(new Date(), 'ID expiry date must be in the future')
  ),
  addressProofType: z.enum(Object.values(AddressProofType) as [string, ...string[]], {
    errorMap: () => ({ message: 'Invalid address proof type' })
  }),
  addressProofDocument: z
    .string()
    .regex(/^data:image\/(png|jpg|jpeg);base64,/, 'Invalid base64 image format')
    .refine((val) => val.length <= 5 * 1024 * 1024, 'Address proof document must not exceed 5MB')
});

export const rejectKycSchema = z.object({
  rejectionReason: z
    .string()
    .min(10, 'Rejection reason must be at least 10 characters long')
    .max(500, 'Rejection reason must not exceed 500 characters')
});
