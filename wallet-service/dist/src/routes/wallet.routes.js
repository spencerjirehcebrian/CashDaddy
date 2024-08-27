import { ZodValidation } from '@cash-daddy/shared';
import express from 'express';
import { createWalletSchema, depositSchema, withdrawSchema, transferSchema } from '../validators/wallet.validators.js';
const router = (walletController, authMiddleware) => {
    const walletRouter = express.Router();
    // User routes
    walletRouter.post('/', authMiddleware.requireAuth, ZodValidation(createWalletSchema), walletController.createWallet.bind(walletController));
    walletRouter.get('/balance', authMiddleware.requireAuth, walletController.getBalance.bind(walletController));
    walletRouter.post('/deposit', authMiddleware.requireAuth, ZodValidation(depositSchema), walletController.deposit.bind(walletController));
    walletRouter.post('/withdraw', authMiddleware.requireAuth, ZodValidation(withdrawSchema), walletController.withdraw.bind(walletController));
    walletRouter.post('/transfer', authMiddleware.requireAuth, ZodValidation(transferSchema), walletController.transfer.bind(walletController));
    walletRouter.get('/transactions', authMiddleware.requireAuth, walletController.getTransactionHistory.bind(walletController));
    walletRouter.get('/transaction/:transactionId', authMiddleware.requireAuth, walletController.getTransaction.bind(walletController));
    return walletRouter;
};
export default router;
