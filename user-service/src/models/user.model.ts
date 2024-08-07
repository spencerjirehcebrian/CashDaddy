import mongoose from "mongoose";
import { UserRole } from "../types";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
  userProfile: { type: mongoose.Schema.Types.ObjectId, ref: "UserProfile" },
  kyc: { type: mongoose.Schema.Types.ObjectId, ref: "KnowYourCustomer" },
  paymentMethods: [
    { type: mongoose.Schema.Types.ObjectId, ref: "PaymentMethod" },
  ],
});

export const User = mongoose.model("users", userSchema);
