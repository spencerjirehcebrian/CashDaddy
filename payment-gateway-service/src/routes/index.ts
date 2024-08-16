import express from 'express';
import userRoutes from './user.routes';
import userProfileRoutes from './user-profile.routes';
import kycRoutes from './kyc.routes';
import paymentMethodRoutes from './payment-method.routes';
import { createRateLimiter } from '../middlewares/rate-limit.middleware';

const router = express.Router();
router.use(createRateLimiter());

router.use('/users', userRoutes);
router.use('/profiles', userProfileRoutes);
router.use('/kyc', kycRoutes);
router.use('/payment-methods', paymentMethodRoutes);

export default router;
