var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BadRequestError, NotFoundError, CustomLogger } from '@cash-daddy/shared';
import { TransactionType, TransactionStatus } from '../../interfaces/index.js';
import { Wallet } from '../../models/wallet.model.js';
import { Transaction } from '../../models/transactions.model.js';
// import crypto from 'crypto';
import { CacheInvalidate } from '../../decorators/caching.decorator.js';
// const STRIPE_TEST_PAYMENT_METHODS = new Set([
//   'pm_card_visa',
//   'pm_card_mastercard',
//   'pm_card_amex',
//   'pm_card_discover',
//   'pm_card_diners',
//   'pm_card_jcb',
//   'pm_card_unionpay',
//   'pm_card_visa_debit',
//   'pm_card_mastercard_prepaid',
//   'pm_card_threeDSecure2Required',
//   'pm_usBankAccount',
//   'pm_sepaDebit',
//   'pm_bacsDebit',
//   'pm_alipay',
//   'pm_wechat'
// ]);
export class WalletService {
    constructor(stripeService, kafkaProducer) {
        this.stripeService = stripeService;
        this.kafkaProducer = kafkaProducer;
        this.kafkaDataPromiseResolve = null;
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
            }
            CustomLogger.info(`Wallet created for user ${userId} with initial balance ${initialBalance}`);
            this.kafkaProducer.send({
                topic: 'notification-events',
                messages: [
                    {
                        value: JSON.stringify({
                            action: 'triggerNotificationWalletCreation',
                            payload: { userId, initialBalance }
                        })
                    }
                ]
            });
            return wallet;
        }
        catch (error) {
            CustomLogger.error('Error in createWallet:', error);
            if (error instanceof Error) {
                throw new BadRequestError(`${error.message}`);
            }
            else {
                throw new BadRequestError('Failed to create wallet: Unknown error');
            }
        }
    }
    // @Cacheable({ keyPrefix: 'wallet' })
    async getBalance(userId) {
        const wallet = await Wallet.findOne({ user: userId });
        if (!wallet) {
            throw new NotFoundError('Wallet not found');
        }
        return { balance: wallet.balance };
    }
    async deposit(userId, amount, paymentMethodId) {
        try {
            const wallet = await Wallet.findOne({ user: userId });
            if (!wallet) {
                throw new NotFoundError('Wallet not found');
            }
            this.kafkaProducer.send({
                topic: 'payment-events',
                messages: [
                    {
                        value: JSON.stringify({
                            action: 'getPaymentMethod',
                            payload: { userId, paymentMethodId }
                        })
                    }
                ]
            });
            const paymentMethodData = await new Promise((resolve) => {
                this.kafkaDataPromiseResolve = resolve;
                setTimeout(() => {
                    if (this.kafkaDataPromiseResolve) {
                        this.kafkaDataPromiseResolve(null);
                        this.kafkaDataPromiseResolve = null;
                    }
                }, 5000);
            });
            if (!paymentMethodData) {
                throw new NotFoundError('Payment method not found or does not belong to this user');
            }
            // if (STRIPE_TEST_PAYMENT_METHODS.has(paymentMethodId)) {
            //   paymentIntent = {
            //     id: `pi_simulated_${crypto.randomBytes(16).toString('hex')}`,
            //     status: 'succeeded',
            //     amount: amount * 100
            //   } as Stripe.PaymentIntent;
            //   CustomLogger.info(`Simulated payment intent for test payment method: ${JSON.stringify(paymentIntent)}`);
            // } else {
            await this.kafkaProducer.send({
                topic: 'payment-events',
                messages: [
                    {
                        value: JSON.stringify({
                            action: 'triggerPaymentIntentAuto',
                            payload: { amount: amount * 100, currency: 'usd', customerId: wallet.stripeCustomerId, paymentMethodId }
                        })
                    }
                ]
            });
            const paymentIntent = await new Promise((resolve) => {
                this.kafkaDataPromiseResolve = resolve;
                setTimeout(() => {
                    if (this.kafkaDataPromiseResolve) {
                        this.kafkaDataPromiseResolve(null);
                        this.kafkaDataPromiseResolve = null;
                    }
                }, 10000);
            });
            if (paymentIntent?.status === 'succeeded') {
                const depositAmount = paymentIntent.amount / 100;
                wallet.balance += depositAmount;
                await wallet.save();
                const transaction = await this.createTransaction(TransactionType.DEPOSIT, depositAmount, null, wallet._id.toString(), paymentIntent.id);
                CustomLogger.info(`Transaction created for user ${wallet.user} with deposit amount ${depositAmount} and transaction ID ${transaction._id}`);
                this.kafkaProducer.send({
                    topic: 'notification-events',
                    messages: [
                        {
                            value: JSON.stringify({
                                action: 'triggerNotificationDeposit',
                                payload: { userId, amount: depositAmount, transactionId: transaction._id }
                            })
                        }
                    ]
                });
                return {
                    balance: wallet.balance,
                    transactionId: paymentIntent.id
                };
            }
            else {
                throw new BadRequestError('Deposit failed: Payment not succeeded');
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
    async withdraw(userId, amount) {
        try {
            const wallet = await Wallet.findOne({ user: userId });
            if (!wallet) {
                throw new NotFoundError('Wallet not found');
            }
            if (wallet.balance < amount) {
                throw new BadRequestError('Insufficient funds');
            }
            // const payout = await this.stripeService.createPayout(amount, wallet.stripeCustomerId);
            this.kafkaProducer.send({
                topic: 'payment-events',
                messages: [
                    {
                        value: JSON.stringify({
                            action: 'createPayout',
                            payload: { customerId: wallet.stripeCustomerId, amount }
                        })
                    }
                ]
            });
            const payout = await new Promise((resolve) => {
                this.kafkaDataPromiseResolve = resolve;
                setTimeout(() => {
                    if (this.kafkaDataPromiseResolve) {
                        this.kafkaDataPromiseResolve(null);
                        this.kafkaDataPromiseResolve = null;
                    }
                }, 10000);
            });
            if (!payout) {
                throw new BadRequestError('Payout failed');
            }
            wallet.balance -= amount;
            await wallet.save();
            const transaction = await this.createTransaction(TransactionType.WITHDRAW, amount, wallet._id.toString(), null, payout.id);
            CustomLogger.info(`Transaction created for user ${userId} with withdrawal amount ${amount} and transaction ID ${transaction._id}`);
            this.kafkaProducer.send({
                topic: 'notification-events',
                messages: [
                    {
                        value: JSON.stringify({
                            action: 'triggerNotificationWithdrawal',
                            payload: {
                                userId,
                                amount,
                                transactionId: transaction._id,
                                withdrawalStatus: 'completed',
                                withdrawalMethod: 'bank_transfer',
                                newBalanace: wallet.balance,
                                failureReason: 'none'
                            }
                        })
                    }
                ]
            });
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
            CustomLogger.info(`Transaction created for user ${fromUserId} with transfer amount ${amount} and transaction ID ${transaction._id}`);
            this.kafkaProducer.send({
                topic: 'notification-events',
                messages: [
                    {
                        value: JSON.stringify({
                            action: 'triggerNotificationTransfer',
                            payload: {
                                fromUserId,
                                toUserId,
                                amount,
                                transactionId: transaction._id,
                                fromBalance: fromWallet.balance,
                                toBalance: toWallet.balance
                            }
                        })
                    }
                ]
            });
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
    // @Cacheable({ keyPrefix: 'wallet' })
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
    async getTransaction(transactionId) {
        const transaction = await Transaction.findOne({ _id: transactionId });
        if (!transaction) {
            throw new NotFoundError('Transaction not found');
        }
        return transaction;
    }
    async createTransaction(type, amount, fromWalletId, toWalletId, stripePaymentIntentId = null, status = TransactionStatus.COMPLETED, metadata = {}) {
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
    // Kafka Actions
    handleReturnData(userData) {
        if (this.kafkaDataPromiseResolve) {
            this.kafkaDataPromiseResolve(userData);
            this.kafkaDataPromiseResolve = null;
        }
        else {
            CustomLogger.warn('Received kafka for wallet service, but no pending action or empty data');
        }
    }
    async handleGetWallet(userId) {
        try {
            CustomLogger.info('Handling getWallet event for user:', userId);
            const wallet = await Wallet.findOne({ user: userId });
            if (!wallet) {
                throw new NotFoundError('Wallet not found');
            }
            CustomLogger.info('Returning wallet;' + JSON.stringify(wallet));
            this.kafkaProducer.send({
                topic: 'payment-events',
                messages: [
                    {
                        value: JSON.stringify({
                            action: 'returnData',
                            payload: wallet
                        })
                    }
                ]
            });
        }
        catch (error) {
            CustomLogger.error('Error processing Kafka message:', error);
        }
    }
    async handleReturnDataQR(userId) {
        try {
            CustomLogger.info('Handling getWallet event for user:', userId);
            const wallet = await Wallet.findOne({ user: userId });
            if (!wallet) {
                throw new NotFoundError('Wallet not found');
            }
            CustomLogger.info('Returning wallet;' + JSON.stringify(wallet));
            this.kafkaProducer.send({
                topic: 'payment-events',
                messages: [
                    {
                        value: JSON.stringify({
                            action: 'returnDataQR',
                            payload: wallet
                        })
                    }
                ]
            });
        }
        catch (error) {
            CustomLogger.error('Error processing Kafka message:', error);
        }
    }
    async handleReturnTransactionData(paymentIntentId, status) {
        try {
            const transaction = await Transaction.findById(paymentIntentId);
            if (transaction?.status !== status) {
                throw new NotFoundError('Transaction not found');
            }
            CustomLogger.info('Returning transaction');
            this.kafkaProducer.send({
                topic: 'payment-events',
                messages: [
                    {
                        value: JSON.stringify({
                            action: 'returnDataQR',
                            payload: transaction
                        })
                    }
                ]
            });
        }
        catch (error) {
            CustomLogger.error('Error getting Kafka Data', error);
        }
    }
    async handleReturnTransactionDataCompleted(paymentIntentId, status) {
        try {
            const transaction = await Transaction.findOne({ stripePaymentIntentId: paymentIntentId, status });
            if (!transaction) {
                throw new NotFoundError('Transaction not found');
            }
            CustomLogger.info('Returning transaction');
            transaction.status = TransactionStatus.COMPLETED;
            await transaction.save();
            CustomLogger.info('Returning transaction;' + JSON.stringify(transaction));
            this.kafkaProducer.send({
                topic: 'payment-events',
                messages: [
                    {
                        value: JSON.stringify({
                            action: 'returnData',
                            payload: transaction
                        })
                    }
                ]
            });
        }
        catch (error) {
            CustomLogger.error('Error processing Kafka message:', error);
        }
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
    CacheInvalidate({ keyPrefix: 'wallet' })
], WalletService.prototype, "withdraw", null);
__decorate([
    CacheInvalidate({ keyPrefix: 'wallet' })
], WalletService.prototype, "transfer", null);
