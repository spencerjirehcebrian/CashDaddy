import mongoose, { Schema } from 'mongoose';
import { IKYC, VerificationStatus, IdType, AddressProofType } from '../interfaces/models/kyc.interface';

const kycSchema = new Schema<IKYC>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    idType: {
      type: String,
      enum: Object.values(IdType),
      required: true
    },
    idNumber: { type: String, required: true },
    idExpiryDate: { type: Date, required: true },
    addressProofType: {
      type: String,
      enum: Object.values(AddressProofType),
      required: true
    },
    addressProofDocument: { type: String, required: true },
    verificationStatus: {
      type: String,
      enum: Object.values(VerificationStatus),
      default: VerificationStatus.PENDING
    },
    rejectionReason: { type: String }
  },
  {
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
  }
);

export const KnowYourCustomer = mongoose.model<IKYC>('KnowYourCustomer', kycSchema);
