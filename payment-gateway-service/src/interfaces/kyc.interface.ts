import { IUser } from './user.interface';

export enum VerificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  NOT_SUBMITTED = 'NOT_SUBMITTED'
}

export enum IdType {
  PASSPORT = 'PASSPORT',
  DRIVERS_LICENSE = 'DRIVERS_LICENSE',
  NATIONAL_ID = 'NATIONAL_ID'
}

export enum AddressProofType {
  UTILITY_BILL = 'UTILITY_BILL',
  BANK_STATEMENT = 'BANK_STATEMENT',
  GOVERNMENT_LETTER = 'GOVERNMENT_LETTER'
}

export interface IKYC extends Document {
  user: string | IUser;
  idType: IdType;
  idNumber: string;
  idExpiryDate: Date;
  addressProofType: AddressProofType;
  addressProofDocument: string; // Base64 encoded image
  verificationStatus: VerificationStatus;
  rejectionReason?: string;
}

