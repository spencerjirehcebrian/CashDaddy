import { AuthMiddleware, ZodValidation } from '@cash-daddy/shared';
import express from 'express';
import { WalletController } from '../controller/wallet.controller.js';
import { createWalletSchema, depositSchema, withdrawSchema, transferSchema } from '../validators/wallet.validators.js';

const router = (walletController: WalletController, authMiddleware: AuthMiddleware) => {
  const walletRouter = express.Router();

  // User routes
  walletRouter.post(
    '/',
    authMiddleware.requireKYCVerified,
    ZodValidation(createWalletSchema),
    walletController.createWallet.bind(walletController)
  );
  walletRouter.get('/balance', authMiddleware.requireKYCVerified, walletController.getBalance.bind(walletController));
  walletRouter.post(
    '/deposit',
    authMiddleware.requireKYCVerified,
    ZodValidation(depositSchema),
    walletController.deposit.bind(walletController)
  );
  walletRouter.post(
    '/withdraw',
    authMiddleware.requireKYCVerified,
    ZodValidation(withdrawSchema),
    walletController.withdraw.bind(walletController)
  );
  walletRouter.post(
    '/transfer',
    authMiddleware.requireKYCVerified,
    ZodValidation(transferSchema),
    walletController.transfer.bind(walletController)
  );
  walletRouter.get('/transactions', authMiddleware.requireKYCVerified, walletController.getTransactionHistory.bind(walletController));
  walletRouter.get(
    '/transaction/:transactionId',
    authMiddleware.requireKYCVerified,
    walletController.getTransaction.bind(walletController)
  );

  return walletRouter;
};

export default router;
