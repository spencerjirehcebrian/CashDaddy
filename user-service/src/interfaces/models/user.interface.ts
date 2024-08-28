import { IKYC } from '@cash-daddy/shared';
import { IUserProfile } from './user-profile.interface.js';
import { Types } from 'mongoose';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  stripeCustomerId?: string;
  userProfile?: Types.ObjectId | IUserProfile;
  kyc?: Types.ObjectId | IKYC;
  isValidPassword(password: string): Promise<boolean>;
}
export interface UserDocument extends IUser, Document {}
