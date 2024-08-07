import mongoose from "mongoose";

const paymentMethodSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["credit_card", "bank_account"], required: true },
  details: { type: Object },
  isDefault: { type: Boolean, default: false },
});

export const PaymentMethod = mongoose.model(
  "payment_method",
  paymentMethodSchema
);
