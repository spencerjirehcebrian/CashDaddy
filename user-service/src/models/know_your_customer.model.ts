import mongoose from "mongoose";

const kycSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  idType: { type: String },
  idNumber: { type: String },
  verificationStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
});

export const KnowYourCustomer = mongoose.model("know_your_customer", kycSchema);
