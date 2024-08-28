import { z } from 'zod';
import { AddressProofType, IdType } from '../interfaces/index.js';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

export const kycSchema = z.object({
  idType: z.enum(Object.values(IdType) as [string, ...string[]], {
    required_error: 'ID type is required',
    invalid_type_error: 'Invalid ID type'
  }),
  idNumber: z
    .string({
      required_error: 'ID number is required'
    })
    .regex(/^[A-Z0-9]{6,20}$/, 'ID number must be 6-20 alphanumeric characters'),
  idExpiryDate: z.preprocess(
    (arg) => {
      if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
      return arg;
    },
    z
      .date({
        required_error: 'ID expiry date is required',
        invalid_type_error: 'Invalid date format for ID expiry'
      })
      .min(new Date(), 'ID expiry date must be in the future')
  ),
  addressProofType: z.enum(Object.values(AddressProofType) as [string, ...string[]], {
    required_error: 'Address proof type is required',
    invalid_type_error: 'Invalid address proof type'
  }),
  addressProofDocument: z
    .custom<Express.Multer.File | undefined>((file) => file instanceof Object && 'buffer' in file, {
      message: 'File upload is required'
    })
    .refine((file) => file && file.size <= MAX_FILE_SIZE, `File size should be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`)
    .refine((file) => file && ACCEPTED_FILE_TYPES.includes(file.mimetype), 'Only .jpg, .jpeg, .png and .pdf files are accepted.')
});

export const rejectKycSchema = z.object({
  rejectionReason: z
    .string()
    .min(10, 'Rejection reason must be at least 10 characters long')
    .max(500, 'Rejection reason must not exceed 500 characters')
});
