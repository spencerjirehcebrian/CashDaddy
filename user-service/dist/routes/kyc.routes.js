"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validation_middleware_1 = require("../middlewares/validation.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const kyc_controller_1 = require("../controller/kyc.controller");
const kyc_validator_1 = require("../validators/kyc.validator");
const router = express_1.default.Router();
// User routes
router.post('/', auth_middleware_1.requireAuth, (0, validation_middleware_1.joiValidation)(kyc_validator_1.kycSchema), kyc_controller_1.KYCController.submitOrUpdateKYC);
router.get('/me', auth_middleware_1.requireAuth, kyc_controller_1.KYCController.getOwnKYCStatus);
// Admin routes
router.get('/:userId', auth_middleware_1.requireAdmin, kyc_controller_1.KYCController.getKYCStatus);
router.post('/:kycId/approve', auth_middleware_1.requireAdmin, kyc_controller_1.KYCController.approveKYC);
router.post('/:kycId/reject', auth_middleware_1.requireAdmin, (0, validation_middleware_1.joiValidation)(kyc_validator_1.rejectKycSchema), kyc_controller_1.KYCController.rejectKYC);
exports.default = router;
