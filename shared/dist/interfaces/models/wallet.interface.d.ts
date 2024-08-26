import { Document, Types } from "mongoose";
export interface IWallet extends Document {
    user: Types.ObjectId;
    balance: number;
    currency: string;
    stripeCustomerId: string;
    createdAt: Date;
    updatedAt: Date;
}
