import { BadRequestError, NotFoundError, CustomLogger, IPaymentMethod } from '@cash-daddy/shared';
import { IWallet, ITransaction, IWalletService, TransactionType, TransactionStatus } from '../../interfaces/index.js';
import { Wallet } from '../../models/wallet.model.js';
import { Transaction } from '../../models/transactions.model.js';
// import crypto from 'crypto';
import { CacheInvalidate } from '../../decorators/caching.decorator.js';
import { IStripeService } from '../../interfaces/services/stripe.service.interface.js';
import Stripe from 'stripe';
import { Producer } from 'kafkajs';

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

export class WalletService implements IWalletService {
  private kafkaDataPromiseResolve: ((value: unknown) => void) | null = null;

  constructor(
    private stripeService: IStripeService,
    private kafkaProducer: Producer
  ) {}

  @CacheInvalidate({ keyPrefix: 'wallet' })
  @CacheInvalidate({ keyPrefix: 'user' })
  async createWallet(userId: string, initialBalance: number): Promise<IWallet> {
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
        CustomLogger.info(
          `Transaction created for user ${userId} with initial balance ${initialBalance} and transaction ID ${transaction._id}`
        );
        // await this.notificationService.notifyDeposit(userId, initialBalance, transaction._id);
      }

      CustomLogger.info(`Wallet created for user ${userId} with initial balance ${initialBalance}`);

      return wallet;
    } catch (error: unknown) {
      CustomLogger.error('Error in createWallet:', error);
      if (error instanceof Error) {
        throw new BadRequestError(`${error.message}`);
      } else {
        throw new BadRequestError('Failed to create wallet: Unknown error');
      }
    }
  }

  // @Cacheable({ keyPrefix: 'wallet' })
  async getBalance(userId: string): Promise<{ balance: number }> {
    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      throw new NotFoundError('Wallet not found');
    }
    return { balance: wallet.balance };
  }

  @CacheInvalidate({ keyPrefix: 'wallet' })
  async deposit(userId: string, amount: number, paymentMethodId: string): Promise<{ balance: number; transactionId: string }> {
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

      const paymentMethodData: IPaymentMethod | null = await new Promise((resolve) => {
        this.kafkaDataPromiseResolve = resolve as (value: unknown) => void;
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

      const paymentIntent: Stripe.PaymentIntent | null = await new Promise((resolve) => {
        this.kafkaDataPromiseResolve = resolve as (value: unknown) => void;
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
        const transaction = await this.createTransaction(
          TransactionType.DEPOSIT,
          depositAmount,
          null,
          wallet._id.toString(),
          paymentIntent.id
        );
        CustomLogger.info(
          `Transaction created for user ${wallet.user} with deposit amount ${depositAmount} and transaction ID ${transaction._id}`
        );
        return {
          balance: wallet.balance,
          transactionId: paymentIntent.id
        };
      } else {
        throw new BadRequestError('Deposit failed: Payment not succeeded');
      }
    } catch (error: unknown) {
      CustomLogger.error('Error in deposit:', error);
      if (error instanceof Error) {
        throw new BadRequestError(`Deposit failed: ${error.message}`);
      } else {
        throw new BadRequestError('Deposit failed: Unknown error');
      }
    }
  }

  @CacheInvalidate({ keyPrefix: 'wallet' })
  async withdraw(userId: string, amount: number): Promise<{ balance: number; payoutId: string }> {
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

      const payout: Stripe.Payout | null = await new Promise((resolve) => {
        this.kafkaDataPromiseResolve = resolve as (value: unknown) => void;
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

      //   await this.notificationService.notifyWithdrawal(userId, amount, transaction._id, 'completed', 'bank_transfer');

      CustomLogger.info(`Transaction created for user ${userId} with withdrawal amount ${amount} and transaction ID ${transaction._id}`);

      return { balance: wallet.balance, payoutId: payout.id };
    } catch (error) {
      CustomLogger.error('Error in withdraw:', error);
      if (error instanceof Error) {
        throw new BadRequestError(`Withdrawal failed: ${error.message}`);
      } else {
        throw new BadRequestError('Withdrawal failed: Unknown error');
      }
    }
  }

  @CacheInvalidate({ keyPrefix: 'wallet' })
  async transfer(fromUserId: string, toUserId: string, amount: number): Promise<{ fromBalance: number; toBalance: number }> {
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

      const transaction = await this.createTransaction(
        TransactionType.TRANSFER,
        amount,
        fromWallet._id.toString(),
        toWallet._id.toString()
      );

      //   await this.notificationService.notifyTransfer(fromUserId, toUserId, amount, transaction._id, fromWallet.balance, toWallet.balance);

      CustomLogger.info(`Transaction created for user ${fromUserId} with transfer amount ${amount} and transaction ID ${transaction._id}`);

      return { fromBalance: fromWallet.balance, toBalance: toWallet.balance };
    } catch (error: unknown) {
      if (error instanceof Error) {
        CustomLogger.error('Error in transfer:', error);
        throw new BadRequestError(`Transfer failed: ${error.message}`);
      } else {
        CustomLogger.error('Unknown error in transfer');
        throw new BadRequestError('Transfer failed: Unknown error');
      }
    }
  }

  // @Cacheable({ keyPrefix: 'wallet' })
  async getTransactionHistory(userId: string): Promise<ITransaction[]> {
    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      throw new NotFoundError('Wallet not found');
    }

    const transactions = await Transaction.find({
      $or: [{ fromWallet: wallet._id }, { toWallet: wallet._id }]
    }).sort({ createdAt: -1 });

    return transactions;
  }

  private async createTransaction(
    type: TransactionType,
    amount: number,
    fromWalletId: string | null,
    toWalletId: string | null,
    stripePaymentIntentId: string | null = null,
    status: string = TransactionStatus.COMPLETED,
    metadata: Record<string, unknown> = {}
  ): Promise<ITransaction> {
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
  handleReturnData(userData: unknown): void {
    if (this.kafkaDataPromiseResolve) {
      this.kafkaDataPromiseResolve(userData);
      this.kafkaDataPromiseResolve = null;
    } else {
      CustomLogger.warn('Received kafka for wallet service, but no pending action or empty data');
    }
  }

  async handleGetWallet(userId: string): Promise<void> {
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
    } catch (error) {
      CustomLogger.error('Error processing Kafka message:', error);
    }
  }
}
