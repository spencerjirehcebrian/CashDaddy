import mongoose, { Schema } from 'mongoose';
import { IPaymentMethod } from '../interfaces/models/payment-method.interface.js';

const paymentMethodSchema = new Schema<IPaymentMethod>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stripePaymentMethodId: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true
  },
  card: {
    brand: String,
    last4: String,
    expMonth: Number,
    expYear: Number
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create and export the model
export const PaymentMethod = mongoose.model<IPaymentMethod>('PaymentMethod', paymentMethodSchema);
