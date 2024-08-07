import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  dateOfBirth: { type: Date },
  address: { type: String },
  phoneNumber: { type: String },
});

export const UserProfile = mongoose.model("user_profiles", userProfileSchema);
