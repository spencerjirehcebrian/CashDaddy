import mongoose, { Schema } from 'mongoose';
const userProfileSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dateOfBirth: { type: Date, required: true },
    phoneNumber: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    postalCode: { type: String, required: true }
}, {
    timestamps: true,
    toJSON: {
        transform: function (_doc, ret) {
            delete ret.__v;
            return ret;
        }
    },
    toObject: {
        transform: function (_doc, ret) {
            delete ret.__v;
            return ret;
        }
    }
});
export const UserProfile = mongoose.model('UserProfile', userProfileSchema);
