import { CustomLogger, TransactionStatus } from '@cash-daddy/shared';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { PaymentMethod } from '../models/payment-method.model.js';
export class QRPaymentController {
    constructor(stripeService, kafkaProducer, paymentMethodService) {
        this.stripeService = stripeService;
        this.kafkaProducer = kafkaProducer;
        this.paymentMethodService = paymentMethodService;
        this.kafkaDataPromiseResolve = null;
    }
    handleReturnKafkaData(kafkaData) {
        CustomLogger.info('Received data from Kafka:', kafkaData);
        if (this.kafkaDataPromiseResolve) {
            this.kafkaDataPromiseResolve(kafkaData);
            this.kafkaDataPromiseResolve = null;
        }
        else {
            CustomLogger.warn('Received data from Kafka but no promise was found --');
        }
    }
    async generatePaymentQR(req, res) {
        try {
            const { amount } = req.body;
            const userId = req.user.userId;
            if (!userId || !amount) {
                res.status(400).json({ error: 'Missing required parameters' });
                return;
            }
            this.kafkaProducer.send({
                topic: 'wallet-events',
                messages: [
                    {
                        value: JSON.stringify({
                            action: 'getWalletDataQR',
                            payload: {
                                userId: req.user.userId
                            }
                        })
                    }
                ]
            });
            const kafkaData = await new Promise((resolve) => {
                CustomLogger.info('Waiting for data from Kafka...');
                this.kafkaDataPromiseResolve = resolve;
                setTimeout(() => {
                    if (this.kafkaDataPromiseResolve) {
                        this.kafkaDataPromiseResolve(null);
                        this.kafkaDataPromiseResolve = null;
                    }
                }, 10000);
            });
            if (!kafkaData) {
                res.status(404).json({ error: 'Wallet not found' });
                return;
            }
            const paymentId = crypto.randomBytes(16).toString('hex');
            const qrData = JSON.stringify({
                paymentId,
                amount,
                recipient: userId
            });
            const qrCodeDataURL = await QRCode.toDataURL(qrData);
            // Create a pending transaction
            //   await this.walletService.createTransaction(
            //     'transfer',
            //     amount,
            //     null, // fromWallet is null for QR code generation
            //     wallet._id,
            //     null,
            //     'pending',
            //     { paymentId }
            //   );
            CustomLogger.info(`Generated QR code for payment: ${paymentId}`);
            res.status(200).json({ qrCodeDataURL, paymentId });
        }
        catch (error) {
            CustomLogger.error(`Failed to generate QR code: ${error.message}`);
            res.status(500).json({ error: 'Failed to generate QR code' });
        }
    }
    async initiateQRPayment(req, res) {
        try {
            const { paymentId, payerId, paymentMethodId } = req.body;
            if (!paymentId || !payerId || !paymentMethodId) {
                res.status(400).json({ error: 'Missing required parameters' });
                return;
            }
            this.kafkaProducer.send({
                topic: 'wallet-events',
                messages: [
                    {
                        value: JSON.stringify({
                            action: 'getTransactionDataQR',
                            payload: {
                                paymentIntentId: paymentId,
                                status: TransactionStatus.PENDING
                            }
                        })
                    }
                ]
            });
            const transaction = await new Promise((resolve) => {
                this.kafkaDataPromiseResolve = resolve;
                setTimeout(() => {
                    if (this.kafkaDataPromiseResolve) {
                        this.kafkaDataPromiseResolve(null);
                        this.kafkaDataPromiseResolve = null;
                    }
                }, 10000);
            });
            if (!transaction) {
                res.status(404).json({ error: 'Invalid payment ID' });
                return;
            }
            this.kafkaProducer.send({
                topic: 'wallet-events',
                messages: [
                    {
                        value: JSON.stringify({
                            action: 'returnWalletData',
                            payload: payerId
                        })
                    }
                ]
            });
            const payerWallet = await new Promise((resolve) => {
                this.kafkaDataPromiseResolve = resolve;
                setTimeout(() => {
                    if (this.kafkaDataPromiseResolve) {
                        this.kafkaDataPromiseResolve(null);
                        this.kafkaDataPromiseResolve = null;
                    }
                }, 10000);
            });
            if (!payerWallet) {
                res.status(404).json({ error: 'Payer wallet not found' });
                return;
            }
            if (payerWallet.balance < transaction.amount) {
                res.status(400).json({ error: 'Insufficient funds' });
                return;
            }
            const paymentMethod = await PaymentMethod.findOne({
                user: payerId,
                stripePaymentMethodId: paymentMethodId
            });
            if (!paymentMethod) {
                res.status(404).json({ error: 'Payment method not found or does not belong to this user' });
                return;
            }
            // Set the fromWallet
            //   transaction.fromWallet = payerWallet._id;
            //   await transaction.save();
            const paymentIntent = await this.stripeService.createPaymentIntent(transaction.amount * 100, // Convert to cents
            'usd', payerWallet.stripeCustomerId, paymentMethodId);
            //   transaction.stripePaymentIntentId = paymentIntent.id;
            //   await transaction.save();
            CustomLogger.info(`Initiated QR payment: ${paymentIntent.id}`);
            res.status(200).json({
                clientSecret: paymentIntent.client_secret,
                amount: transaction.amount,
                paymentIntentId: paymentIntent.id,
                status: paymentIntent.status
            });
        }
        catch (error) {
            CustomLogger.error(`Failed to initiate QR payment: ${error.message}`);
            res.status(500).json({ error: 'Failed to initiate QR payment' });
        }
    }
    async confirmQRPayment(req, res) {
        try {
            const { payerId, paymentIntentId, paymentMethodId } = req.body;
            const paymentMethod = await this.paymentMethodService.getPaymentMethod(payerId, paymentMethodId);
            if (!paymentMethod) {
                res.status(404).json({ error: 'Payment method not found or does not belong to this user' });
                return;
            }
            const paymentIntent = await this.stripeService.confirmPaymentIntent(paymentIntentId, paymentMethodId);
            if (paymentIntent.status === 'succeeded') {
                this.kafkaProducer.send({
                    topic: 'wallet-events',
                    messages: [
                        {
                            value: JSON.stringify({
                                action: 'returnTransactionDataCompleted',
                                payload: {
                                    paymentIntentId,
                                    status: TransactionStatus.PENDING
                                }
                            })
                        }
                    ]
                });
                const transaction = await new Promise((resolve) => {
                    this.kafkaDataPromiseResolve = resolve;
                    setTimeout(() => {
                        if (this.kafkaDataPromiseResolve) {
                            this.kafkaDataPromiseResolve(null);
                            this.kafkaDataPromiseResolve = null;
                        }
                    }, 10000);
                });
                if (!transaction) {
                    res.status(404).json({ error: 'Transaction not found' });
                    return;
                }
                this.kafkaProducer.send({
                    topic: 'wallet-events',
                    messages: [
                        {
                            value: JSON.stringify({
                                action: 'getWalletDataQR',
                                payload: { userId: transaction.toWallet }
                            })
                        }
                    ]
                });
                const recipientWallet = await new Promise((resolve) => {
                    this.kafkaDataPromiseResolve = resolve;
                    setTimeout(() => {
                        if (this.kafkaDataPromiseResolve) {
                            this.kafkaDataPromiseResolve(null);
                            this.kafkaDataPromiseResolve = null;
                        }
                    }, 10000);
                });
                if (!recipientWallet) {
                    res.status(404).json({ error: 'Recipient wallet not found' });
                    return;
                }
                this.kafkaProducer.send({
                    topic: 'wallet-events',
                    messages: [
                        {
                            value: JSON.stringify({
                                action: 'getWalletDataQR',
                                payload: { userId: payerId }
                            })
                        }
                    ]
                });
                const payerWallet = await new Promise((resolve) => {
                    this.kafkaDataPromiseResolve = resolve;
                    setTimeout(() => {
                        if (this.kafkaDataPromiseResolve) {
                            this.kafkaDataPromiseResolve(null);
                            this.kafkaDataPromiseResolve = null;
                        }
                    }, 10000);
                });
                if (!payerWallet) {
                    res.status(404).json({ error: 'Payer wallet not found' });
                    return;
                }
                payerWallet.balance -= transaction.amount;
                await payerWallet.save();
                this.kafkaProducer.send({
                    topic: 'notification-events',
                    messages: [
                        {
                            value: JSON.stringify({
                                action: 'triggerNotificationQrPayment',
                                payload: {
                                    payerId,
                                    recipientId: recipientWallet.user.toString(),
                                    amount: transaction.amount,
                                    transactionId: transaction._id,
                                    paymentStatus: 'sent'
                                }
                            })
                        }
                    ]
                });
                CustomLogger.info(`Confirmed QR payment: ${paymentIntentId}`);
                res.status(200).json({ message: 'Payment processed successfully', paymentIntentId });
            }
            else {
                res.status(400).json({ error: 'Payment failed' });
            }
        }
        catch (error) {
            CustomLogger.error(`Failed to confirm QR payment: ${error.message}`);
            res.status(500).json({ error: 'Failed to confirm QR payment' });
        }
    }
}
