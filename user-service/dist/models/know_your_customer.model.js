"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowYourCustomer = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const kycSchema = new mongoose_1.default.Schema({
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    idType: { type: String },
    idNumber: { type: String },
    verificationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
});
exports.KnowYourCustomer = mongoose_1.default.model('know_your_customer', kycSchema);
