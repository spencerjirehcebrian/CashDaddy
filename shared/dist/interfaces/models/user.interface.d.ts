import { Document, Types } from "mongoose";
import { IUserProfile } from "./user-profile.interface";
import { IKYC } from "./kyc.interface";
export declare enum UserRole {
    USER = "USER",
    ADMIN = "ADMIN",
    SUPER_ADMIN = "SUPER_ADMIN"
}
export declare enum UserStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE"
}
export interface IUser extends Document {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    status: UserStatus;
    userProfile?: Types.ObjectId | IUserProfile;
    kyc?: Types.ObjectId | IKYC;
    isValidPassword(password: string): Promise<boolean>;
}
export interface UserDocument extends IUser, Document {
}
