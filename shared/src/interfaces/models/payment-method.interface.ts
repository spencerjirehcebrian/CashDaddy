import mongoose, { Document } from "mongoose";

export interface IPaymentMethod extends Document {
  user: mongoose.Types.ObjectId;
  stripePaymentMethodId: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
  createdAt: Date;
}
