import { BadRequestError, CustomLogger, sendResponse } from '@cash-daddy/shared';
export class WalletController {
    constructor(walletService) {
        this.walletService = walletService;
    }
    async createWallet(req, res, next) {
        try {
            const { initialBalance } = req.body;
            const userId = req.user.userId;
            const result = await this.walletService.createWallet(userId, initialBalance);
            sendResponse(res, 201, true, 'Wallet created successfully', result);
        }
        catch (error) {
            CustomLogger.error('Error creating wallet:', error);
            next(error);
        }
    }
    async deposit(req, res, next) {
        try {
            const { amount, paymentMethodId } = req.body;
            const userId = req.user.userId;
            const result = await this.walletService.deposit(userId, amount, paymentMethodId);
            sendResponse(res, 200, true, 'Deposit successful', result);
        }
        catch (error) {
            if (error instanceof BadRequestError) {
                sendResponse(res, 400, false, error.message);
            }
            else {
                next(error);
            }
        }
    }
    async transfer(req, res, next) {
        try {
            const { amount, toUserId } = req.body;
            const fromUserId = req.user.userId;
            const result = await this.walletService.transfer(fromUserId, toUserId, amount);
            sendResponse(res, 200, true, 'Transfer successful', result);
        }
        catch (error) {
            CustomLogger.error('Error transferring funds:', error);
            next(error);
        }
    }
    async withdraw(req, res, next) {
        try {
            const { amount } = req.body;
            const userId = req.user.userId;
            const result = await this.walletService.withdraw(userId, amount);
            sendResponse(res, 200, true, 'Withdrawal successful', result);
        }
        catch (error) {
            CustomLogger.error('Error withdrawing funds:', error);
            next(error);
        }
    }
    async getBalance(req, res, next) {
        try {
            const userId = req.user.userId;
            const result = await this.walletService.getBalance(userId);
            sendResponse(res, 200, true, 'Balance retrieved successfully', result);
        }
        catch (error) {
            CustomLogger.error('Error getting balance:', error);
            next(error);
        }
    }
    async getTransactionHistory(req, res, next) {
        try {
            const userId = req.user.userId;
            const result = await this.walletService.getTransactionHistory(userId);
            sendResponse(res, 200, true, 'Transaction history retrieved successfully', result);
        }
        catch (error) {
            CustomLogger.error('Error getting transaction history:', error);
            next(error);
        }
    }
}
