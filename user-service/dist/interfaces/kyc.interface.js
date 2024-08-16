"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressProofType = exports.IdType = exports.VerificationStatus = void 0;
var VerificationStatus;
(function (VerificationStatus) {
    VerificationStatus["PENDING"] = "PENDING";
    VerificationStatus["APPROVED"] = "APPROVED";
    VerificationStatus["REJECTED"] = "REJECTED";
    VerificationStatus["NOT_SUBMITTED"] = "NOT_SUBMITTED";
})(VerificationStatus || (exports.VerificationStatus = VerificationStatus = {}));
var IdType;
(function (IdType) {
    IdType["PASSPORT"] = "PASSPORT";
    IdType["DRIVERS_LICENSE"] = "DRIVERS_LICENSE";
    IdType["NATIONAL_ID"] = "NATIONAL_ID";
})(IdType || (exports.IdType = IdType = {}));
var AddressProofType;
(function (AddressProofType) {
    AddressProofType["UTILITY_BILL"] = "UTILITY_BILL";
    AddressProofType["BANK_STATEMENT"] = "BANK_STATEMENT";
    AddressProofType["GOVERNMENT_LETTER"] = "GOVERNMENT_LETTER";
})(AddressProofType || (exports.AddressProofType = AddressProofType = {}));
