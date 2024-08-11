import { Schema } from 'mongoose';
import { IUserProfile } from './user-profile.interface';
import { IKYC } from './kyc.interface';
import { IPaymentMethod } from './payment-method.interface';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  userProfile?: Schema.Types.ObjectId | IUserProfile;
  kyc?: Schema.Types.ObjectId | IKYC;
  paymentMethods: Schema.Types.ObjectId[] | IPaymentMethod[];
  isValidPassword(password: string): Promise<boolean>;
}
export interface UserDocument extends IUser, Document {}
