import express from 'express';
import { joiValidation } from '../middlewares/validation.middleware';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { KYCController } from '../controller/kyc.controller';
import { kycSchema, rejectKycSchema } from '../validators/kyc.validator';

const router = express.Router();

// User routes
router.post('/', requireAuth, joiValidation(kycSchema), KYCController.submitOrUpdateKYC);
router.get('/me', requireAuth, KYCController.getOwnKYCStatus);

// Admin routes
router.get('/:userId', requireAdmin, KYCController.getKYCStatus);
router.post('/:kycId/approve', requireAdmin, KYCController.approveKYC);
router.post('/:kycId/reject', requireAdmin, joiValidation(rejectKycSchema), KYCController.rejectKYC);

export default router;
