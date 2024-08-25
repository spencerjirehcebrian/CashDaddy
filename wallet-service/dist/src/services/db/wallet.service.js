var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BadRequestError, NotFoundError, CustomLogger } from '@cash-daddy/shared';
import { TransactionType } from '../../interfaces/index.js';
import { Wallet } from '../../models/wallet.model.js';
import { Transaction } from '../../models/transactions.model.js';
import crypto from 'crypto';
import { Cacheable, CacheInvalidate } from '../../decorators/caching.decorator.js';
const STRIPE_TEST_PAYMENT_METHODS = new Set([
    'pm_card_visa',
    'pm_card_mastercard',
    'pm_card_amex',
    'pm_card_discover',
    'pm_card_diners',
    'pm_card_jcb',
    'pm_card_unionpay',
    'pm_card_visa_debit',
    'pm_card_mastercard_prepaid',
    'pm_card_threeDSecure2Required',
    'pm_usBankAccount',
    'pm_sepaDebit',
    'pm_bacsDebit',
    'pm_alipay',
    'pm_wechat'
]);
export class WalletService {
    constructor(stripeService) {
        this.stripeService = stripeService;
    }
    async createWallet(userId, initialBalance) {
        try {
            const existingWallet = await Wallet.findOne({ user: userId });
            if (existingWallet) {
                throw new BadRequestError('User already has a wallet');
            }
            const stripeCustomer = await this.stripeService.createCustomer(userId);
            const wallet = new Wallet({
                user: userId,
                balance: initialBalance,
                stripeCustomerId: stripeCustomer.id
            });
            await wallet.save();
            if (initialBalance > 0) {
                const transaction = await this.createTransaction(TransactionType.DEPOSIT, initialBalance, null, wallet._id.toString());
                CustomLogger.info(`Transaction created for user ${userId} with initial balance ${initialBalance} and transaction ID ${transaction._id}`);
                // await this.notificationService.notifyDeposit(userId, initialBalance, transaction._id);
            }
            CustomLogger.info(`Wallet created for user ${userId} with initial balance ${initialBalance}`);
            return wallet;
        }
        catch (error) {
            CustomLogger.error('Error in createWallet:', error);
            if (error instanceof Error) {
                throw new BadRequestError(`Failed to create wallet: ${error.message}`);
            }
            else {
                throw new BadRequestError('Failed to create wallet: Unknown error');
            }
        }
    }
    async deposit(userId, amount, paymentMethodId) {
        try {
            const wallet = await Wallet.findOne({ user: userId });
            if (!wallet) {
                throw new NotFoundError('Wallet not found');
            }
            //   const paymentMethod = await PaymentMethod.findOne({
            //     user: userId,
            //     stripePaymentMethodId: paymentMethodId
            //   });
            //   if (!paymentMethod) {
            //     throw new NotFoundError('Payment method not found or does not belong to this user');
            //   }
            let paymentIntent;
            if (STRIPE_TEST_PAYMENT_METHODS.has(paymentMethodId)) {
                paymentIntent = {
                    id: `pi_simulated_${crypto.randomBytes(16).toString('hex')}`,
                    status: 'succeeded',
                    amount: amount * 100
                };
                CustomLogger.info(`Simulated payment intent for test payment method: ${JSON.stringify(paymentIntent)}`);
            }
            else {
                paymentIntent = await this.stripeService.createPaymentIntent(amount * 100, 'usd', wallet.stripeCustomerId, paymentMethodId);
                paymentIntent = await this.stripeService.confirmPaymentIntent(paymentIntent.id, paymentMethodId);
            }
            if (paymentIntent.status === 'succeeded') {
                const depositAmount = paymentIntent.amount / 100;
                wallet.balance += depositAmount;
                await wallet.save();
                const transaction = await this.createTransaction(TransactionType.DEPOSIT, depositAmount, null, wallet._id.toString(), paymentIntent.id);
                // await this.notificationService.notifyDeposit(wallet.user, depositAmount, transaction._id);
                CustomLogger.info(`Transaction created for user ${wallet.user} with deposit amount ${depositAmount} and transaction ID ${transaction._id}`);
                return {
                    balance: wallet.balance,
                    transactionId: paymentIntent.id
                };
            }
            else {
                throw new BadRequestError('Deposit failed');
            }
        }
        catch (error) {
            CustomLogger.error('Error in deposit:', error);
            if (error instanceof Error) {
                throw new BadRequestError(`Deposit failed: ${error.message}`);
            }
            else {
                throw new BadRequestError('Deposit failed: Unknown error');
            }
        }
    }
    async getBalance(userId) {
        const wallet = await Wallet.findOne({ user: userId });
        if (!wallet) {
            throw new NotFoundError('Wallet not found');
        }
        return { balance: wallet.balance };
    }
    async withdraw(userId, amount) {
        try {
            const wallet = await Wallet.findOne({ user: userId });
            if (!wallet) {
                throw new NotFoundError('Wallet not found');
            }
            if (wallet.balance < amount) {
                throw new BadRequestError('Insufficient funds');
            }
            const payout = await this.stripeService.createPayout(amount, wallet.stripeCustomerId);
            wallet.balance -= amount;
            await wallet.save();
            const transaction = await this.createTransaction(TransactionType.WITHDRAW, amount, wallet._id.toString(), null, payout.id);
            //   await this.notificationService.notifyWithdrawal(userId, amount, transaction._id, 'completed', 'bank_transfer');
            CustomLogger.info(`Transaction created for user ${userId} with withdrawal amount ${amount} and transaction ID ${transaction._id}`);
            return { balance: wallet.balance, payoutId: payout.id };
        }
        catch (error) {
            CustomLogger.error('Error in withdraw:', error);
            if (error instanceof Error) {
                throw new BadRequestError(`Withdrawal failed: ${error.message}`);
            }
            else {
                throw new BadRequestError('Withdrawal failed: Unknown error');
            }
        }
    }
    async transfer(fromUserId, toUserId, amount) {
        try {
            const fromWallet = await Wallet.findOne({ user: fromUserId });
            const toWallet = await Wallet.findOne({ user: toUserId });
            if (!fromWallet || !toWallet) {
                throw new NotFoundError('One or both wallets not found');
            }
            if (fromWallet.balance < amount) {
                throw new BadRequestError('Insufficient funds');
            }
            fromWallet.balance -= amount;
            toWallet.balance += amount;
            await fromWallet.save();
            await toWallet.save();
            const transaction = await this.createTransaction(TransactionType.TRANSFER, amount, fromWallet._id.toString(), toWallet._id.toString());
            //   await this.notificationService.notifyTransfer(fromUserId, toUserId, amount, transaction._id, fromWallet.balance, toWallet.balance);
            CustomLogger.info(`Transaction created for user ${fromUserId} with transfer amount ${amount} and transaction ID ${transaction._id}`);
            return { fromBalance: fromWallet.balance, toBalance: toWallet.balance };
        }
        catch (error) {
            if (error instanceof Error) {
                CustomLogger.error('Error in transfer:', error);
                throw new BadRequestError(`Transfer failed: ${error.message}`);
            }
            else {
                CustomLogger.error('Unknown error in transfer');
                throw new BadRequestError('Transfer failed: Unknown error');
            }
        }
    }
    async getTransactionHistory(userId) {
        const wallet = await Wallet.findOne({ user: userId });
        if (!wallet) {
            throw new NotFoundError('Wallet not found');
        }
        const transactions = await Transaction.find({
            $or: [{ fromWallet: wallet._id }, { toWallet: wallet._id }]
        }).sort({ createdAt: -1 });
        return transactions;
    }
    async createTransaction(type, amount, fromWalletId, toWalletId, stripePaymentIntentId = null, status = 'completed', metadata = {}) {
        const transaction = new Transaction({
            type,
            amount,
            fromWallet: fromWalletId,
            toWallet: toWalletId,
            status,
            stripePaymentIntentId,
            metadata
        });
        await transaction.save();
        return transaction;
    }
}
__decorate([
    CacheInvalidate({ keyPrefix: 'wallet' }),
    CacheInvalidate({ keyPrefix: 'user' })
], WalletService.prototype, "createWallet", null);
__decorate([
    CacheInvalidate({ keyPrefix: 'wallet' })
], WalletService.prototype, "deposit", null);
__decorate([
    Cacheable({ keyPrefix: 'wallet' })
], WalletService.prototype, "getBalance", null);
__decorate([
    CacheInvalidate({ keyPrefix: 'wallet' })
], WalletService.prototype, "withdraw", null);
__decorate([
    CacheInvalidate({ keyPrefix: 'wallet' })
], WalletService.prototype, "transfer", null);
__decorate([
    Cacheable({ keyPrefix: 'wallet' })
], WalletService.prototype, "getTransactionHistory", null);
