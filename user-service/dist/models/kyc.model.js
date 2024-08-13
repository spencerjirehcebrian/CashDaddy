"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowYourCustomer = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const kyc_interface_1 = require("../interfaces/models/kyc.interface");
const kycSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    idType: {
        type: String,
        enum: Object.values(kyc_interface_1.IdType),
        required: true
    },
    idNumber: { type: String, required: true },
    idExpiryDate: { type: Date, required: true },
    addressProofType: {
        type: String,
        enum: Object.values(kyc_interface_1.AddressProofType),
        required: true
    },
    addressProofDocument: { type: String, required: true },
    verificationStatus: {
        type: String,
        enum: Object.values(kyc_interface_1.VerificationStatus),
        default: kyc_interface_1.VerificationStatus.PENDING
    },
    rejectionReason: { type: String }
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
exports.KnowYourCustomer = mongoose_1.default.model('KnowYourCustomer', kycSchema);
