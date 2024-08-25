import { IWallet } from '../interfaces/models/wallet.interface.js';
import mongoose, { Schema } from 'mongoose';

const walletSchema = new Schema<IWallet>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    balance: {
      type: Number,
      default: 0,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    stripeCustomerId: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
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

export const Wallet = mongoose.model<IWallet>('Wallet', walletSchema);
