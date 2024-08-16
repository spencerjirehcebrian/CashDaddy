"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentProvider = exports.PaymentMethodType = void 0;
var PaymentMethodType;
(function (PaymentMethodType) {
    PaymentMethodType["CREDIT_CARD"] = "CREDIT_CARD";
    PaymentMethodType["BANK_ACCOUNT"] = "BANK_ACCOUNT";
})(PaymentMethodType || (exports.PaymentMethodType = PaymentMethodType = {}));
var PaymentProvider;
(function (PaymentProvider) {
    PaymentProvider["STRIPE"] = "STRIPE";
})(PaymentProvider || (exports.PaymentProvider = PaymentProvider = {}));
