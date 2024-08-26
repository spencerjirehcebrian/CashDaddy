import mongoose, { Schema } from 'mongoose';
const paymentMethodSchema = new Schema({
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
export const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);
