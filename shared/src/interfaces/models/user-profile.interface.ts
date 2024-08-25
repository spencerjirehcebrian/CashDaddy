import { Document, Types } from "mongoose";
import { IUser } from "./user.interface";

export interface IUserProfile extends Document {
  user: Types.ObjectId | IUser;
  dateOfBirth: Date;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  createdAt: Date;
  updatedAt: Date;
}
