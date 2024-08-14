import express from 'express';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { kycSchema, rejectKycSchema } from '../validators/kyc.validator';
import { KYCController } from '../controller/kyc.controller';
import { zodValidation } from '../middlewares/validation.middleware';

const router = (kycController: KYCController) => {
  const kycRouter = express.Router();

  // User routes
  kycRouter.post('/', requireAuth, zodValidation(kycSchema), kycController.submitOrUpdateKYC.bind(kycController));
  kycRouter.get('/me', requireAuth, kycController.getOwnKYCStatus.bind(kycController));

  // Admin routes
  kycRouter.get('/:userId', requireAdmin, kycController.getKYCStatus.bind(kycController));
  kycRouter.post('/:userId/approve', requireAdmin, kycController.approveKYC.bind(kycController));
  kycRouter.post('/:userId/reject', requireAdmin, zodValidation(rejectKycSchema), kycController.rejectKYC.bind(kycController));

  return kycRouter;
};

export default router;
