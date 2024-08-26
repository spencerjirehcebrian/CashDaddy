import mongoose, { Schema } from 'mongoose';
import { TransactionStatus, TransactionType } from '../interfaces/models/transactions.interface.js';
const transactionSchema = new Schema({
    type: {
        type: String,
        enum: Object.values(TransactionType),
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'USD'
    },
    fromWallet: {
        type: Schema.Types.ObjectId,
        ref: 'Wallet',
        required: function () {
            return this.type === TransactionType.TRANSFER && this.status !== TransactionStatus.PENDING;
        }
    },
    toWallet: {
        type: Schema.Types.ObjectId,
        ref: 'Wallet',
        required: function () {
            return this.type === TransactionType.TRANSFER || this.type === TransactionType.DEPOSIT;
        }
    },
    status: {
        type: String,
        enum: Object.values(TransactionStatus),
        default: TransactionStatus.PENDING
    },
    stripePaymentIntentId: {
        type: String
    },
    metadata: {
        type: Schema.Types.Mixed
    }
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
export const Transaction = mongoose.model('Transaction', transactionSchema);
