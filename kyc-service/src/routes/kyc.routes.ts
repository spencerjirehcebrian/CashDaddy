import { AuthMiddleware, ZodValidation } from '@cash-daddy/shared';
import express from 'express';
import { KYCController } from '../controller/kyc.controller.js';
import { rejectKycSchema } from '../validators/kyc.validator.js';
import { kycUploadMiddleware } from '../middleware/multer-middleware.js';

const router = (kycController: KYCController, authMiddleware: AuthMiddleware) => {
  const kycRouter = express.Router();

  // User routes
  kycRouter.post(
    '/',
    authMiddleware.requireAuth,
    kycUploadMiddleware('addressProofDocument'),
    kycController.submitOrUpdateKYC.bind(kycController)
  );
  kycRouter.get('/me', authMiddleware.requireAuth, kycController.getOwnKYCStatus.bind(kycController));

  // Admin routes
  kycRouter.get('/:userId', authMiddleware.requireAdmin, kycController.getKYCStatus.bind(kycController));
  kycRouter.post('/:userId/approve', authMiddleware.requireAdmin, kycController.approveKYC.bind(kycController));
  kycRouter.post(
    '/:userId/reject',
    authMiddleware.requireAdmin,
    ZodValidation(rejectKycSchema),
    kycController.rejectKYC.bind(kycController)
  );

  return kycRouter;
};

export default router;
