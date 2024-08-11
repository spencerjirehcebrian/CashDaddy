import mongoose, { Schema } from 'mongoose';
import { IPaymentMethod, PaymentMethodType, PaymentProvider } from '../interfaces/payment-method.interface';

const paymentMethodSchema = new Schema<IPaymentMethod>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  methodType: { 
    type: String, 
    enum: Object.values(PaymentMethodType), 
    required: true 
  },
  provider: { 
    type: String, 
    enum: Object.values(PaymentProvider), 
    required: true 
  },
  tokenId: { type: String, required: true },
  last4: { type: String, required: true, minlength: 4, maxlength: 4 },
  isDefault: { type: Boolean, default: false }
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

export const PaymentMethod = mongoose.model<IPaymentMethod>('PaymentMethod', paymentMethodSchema);