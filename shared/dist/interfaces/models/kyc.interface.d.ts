import { Document, Types } from "mongoose";
import { IUser } from "./user.interface";
export declare enum VerificationStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    NOT_SUBMITTED = "NOT_SUBMITTED"
}
export declare enum IdType {
    PASSPORT = "PASSPORT",
    DRIVERS_LICENSE = "DRIVERS_LICENSE",
    NATIONAL_ID = "NATIONAL_ID"
}
export declare enum AddressProofType {
    UTILITY_BILL = "UTILITY_BILL",
    BANK_STATEMENT = "BANK_STATEMENT",
    GOVERNMENT_LETTER = "GOVERNMENT_LETTER"
}
export interface IKYC extends Document {
    user: Types.ObjectId | IUser;
    idType: IdType;
    idNumber: string;
    idExpiryDate: Date;
    addressProofType: AddressProofType;
    addressProofDocument: string;
    verificationStatus: VerificationStatus;
    rejectionReason?: string;
}
