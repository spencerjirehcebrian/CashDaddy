import { Document, Types } from "mongoose";

export interface IWallet extends Document {
  user: Types.ObjectId; // Reference to the User model
  balance: number; // Balance in the wallet, defaults to 0
  currency: string; // Currency type, defaults to 'USD'
  stripeCustomerId: string; // Stripe customer ID
  createdAt: Date; // Date when the wallet was created
  updatedAt: Date; // Date when the wallet was last updated
}
