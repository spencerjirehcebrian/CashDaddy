"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validation_middleware_1 = require("../middlewares/validation.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const payment_method_validator_1 = require("../validators/payment-method.validator");
const payment_method_controller_1 = require("../controller/payment-method.controller");
const router = express_1.default.Router();
// User and admin routes
router.use(auth_middleware_1.requireOwnership);
router.post('/', (0, validation_middleware_1.joiValidation)(payment_method_validator_1.paymentMethodSchema), payment_method_controller_1.PaymentMethodController.addPaymentMethod);
router.get('/', payment_method_controller_1.PaymentMethodController.getPaymentMethods);
router.put('/:paymentMethodId', (0, validation_middleware_1.joiValidation)(payment_method_validator_1.updatePaymentMethodSchema), payment_method_controller_1.PaymentMethodController.updatePaymentMethod);
router.delete('/:paymentMethodId', payment_method_controller_1.PaymentMethodController.deletePaymentMethod);
router.post('/:paymentMethodId/set-default', payment_method_controller_1.PaymentMethodController.setDefaultPaymentMethod);
exports.default = router;
