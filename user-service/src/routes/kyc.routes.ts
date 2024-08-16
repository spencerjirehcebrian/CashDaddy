import express from 'express';
import { kycSchema, rejectKycSchema } from '../validators/kyc.validator';
import { KYCController } from '../controller/kyc.controller';
import { zodValidation } from '../middlewares/validation.middleware';
import { AuthMiddleware } from '../middlewares/auth.middleware';

const router = (kycController: KYCController, authMiddleware: AuthMiddleware) => {
  const kycRouter = express.Router();

  // User routes
  kycRouter.post('/', authMiddleware.requireAuth, zodValidation(kycSchema), kycController.submitOrUpdateKYC.bind(kycController));
  kycRouter.get('/me', authMiddleware.requireAuth, kycController.getOwnKYCStatus.bind(kycController));

  // Admin routes
  kycRouter.get('/:userId', authMiddleware.requireAdmin, kycController.getKYCStatus.bind(kycController));
  kycRouter.post('/:userId/approve', authMiddleware.requireAdmin, kycController.approveKYC.bind(kycController));
  kycRouter.post(
    '/:userId/reject',
    authMiddleware.requireAdmin,
    zodValidation(rejectKycSchema),
    kycController.rejectKYC.bind(kycController)
  );

  return kycRouter;
};

export default router;
