"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validation_middleware_1 = require("../middlewares/validation.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const kyc_validator_1 = require("../validators/kyc.validator");
const router = (kycController) => {
    const kycRouter = express_1.default.Router();
    // User routes
    kycRouter.post('/', auth_middleware_1.requireAuth, (0, validation_middleware_1.joiValidation)(kyc_validator_1.kycSchema), kycController.submitOrUpdateKYC.bind(kycController));
    kycRouter.get('/me', auth_middleware_1.requireAuth, kycController.getOwnKYCStatus.bind(kycController));
    // Admin routes
    kycRouter.get('/:userId', auth_middleware_1.requireAdmin, kycController.getKYCStatus.bind(kycController));
    kycRouter.post('/:kycId/approve', auth_middleware_1.requireAdmin, kycController.approveKYC.bind(kycController));
    kycRouter.post('/:kycId/reject', auth_middleware_1.requireAdmin, (0, validation_middleware_1.joiValidation)(kyc_validator_1.rejectKycSchema), kycController.rejectKYC.bind(kycController));
    return kycRouter;
};
exports.default = router;
