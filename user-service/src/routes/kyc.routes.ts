import express from 'express';
import { joiValidation } from '../middlewares/validation.middleware';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { kycSchema, rejectKycSchema } from '../validators/kyc.validator';
import { KYCController } from '../controller/kyc.controller';

const router = (kycController: KYCController) => {
  const kycRouter = express.Router();

  // User routes
  kycRouter.post('/', requireAuth, joiValidation(kycSchema), kycController.submitOrUpdateKYC.bind(kycController));
  kycRouter.get('/me', requireAuth, kycController.getOwnKYCStatus.bind(kycController));

  // Admin routes
  kycRouter.get('/:userId', requireAdmin, kycController.getKYCStatus.bind(kycController));
  kycRouter.post('/:kycId/approve', requireAdmin, kycController.approveKYC.bind(kycController));
  kycRouter.post('/:kycId/reject', requireAdmin, joiValidation(rejectKycSchema), kycController.rejectKYC.bind(kycController));

  return kycRouter;
};

export default router;
