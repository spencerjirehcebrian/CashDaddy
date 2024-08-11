"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentMethod = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const paymentMethodSchema = new mongoose_1.default.Schema({
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['credit_card', 'bank_account'], required: true },
    details: { type: Object },
    isDefault: { type: Boolean, default: false }
});
exports.PaymentMethod = mongoose_1.default.model('payment_method', paymentMethodSchema);
