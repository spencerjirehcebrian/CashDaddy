import Stripe from 'stripe';
import { CustomLogger } from '@cash-daddy/shared';
import { config } from '../../config/index.js';
import crypto from 'crypto';
const stripe = new Stripe(config.STRIPE_SECRET_KEY);
export class StripeService {
    constructor() {
        this.kafkaDataPromiseResolve = null;
    }
    async attachPaymentMethodToCustomer(paymentMethodId, customerId) {
        try {
            // First, retrieve the payment method to check its current status
            const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
            CustomLogger.debug(`Retrieved payment method before attachment: ${JSON.stringify(paymentMethod)}`);
            if (paymentMethod.customer === customerId) {
                CustomLogger.info(`Payment method ${paymentMethodId} is already attached to customer ${customerId}`);
                return paymentMethod;
            }
            if (paymentMethod.customer) {
                // If the payment method is attached to another customer, detach it first
                await stripe.paymentMethods.detach(paymentMethodId);
                CustomLogger.info(`Detached payment method ${paymentMethodId} from previous customer`);
            }
            // Attach the payment method to the new customer
            const attachedPaymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
                customer: customerId
            });
            CustomLogger.info(`Payment method ${paymentMethodId} attached to customer ${customerId}`);
            CustomLogger.debug(`Attached payment method response: ${JSON.stringify(attachedPaymentMethod)}`);
            return attachedPaymentMethod;
        }
        catch (error) {
            CustomLogger.error(`Error in attachPaymentMethodToCustomer: ${error.message}`);
            CustomLogger.error(`Error details: ${JSON.stringify(error)}`);
            throw new Error(`Failed to attach payment method: ${error.message}`);
        }
    }
    async createPaymentIntentAuto(amount, currency, customerId, paymentMethodId) {
        CustomLogger.info(`Creating PaymentIntent: amount=${amount}, currency=${currency}, customerId=${customerId}, paymentMethodId=${paymentMethodId}`);
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount,
                currency,
                customer: customerId,
                payment_method: paymentMethodId,
                confirmation_method: 'manual',
                confirm: true,
                payment_method_types: ['card'],
                use_stripe_sdk: true,
                off_session: true
            });
            CustomLogger.info(`PaymentIntent created: ${JSON.stringify(paymentIntent)}`);
            return paymentIntent;
        }
        catch (error) {
            CustomLogger.error(`Error creating PaymentIntent: ${error.message}`);
            throw error;
        }
    }
    async createPaymentIntent(amount, currency, customerId, paymentMethodId) {
        CustomLogger.info(`Creating PaymentIntent: amount=${amount}, currency=${currency}, customerId=${customerId}, paymentMethodId=${paymentMethodId}`);
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount,
                currency,
                customer: customerId,
                payment_method: paymentMethodId,
                confirmation_method: 'manual',
                payment_method_types: ['card'],
                use_stripe_sdk: true
            });
            CustomLogger.info(`PaymentIntent created: ${JSON.stringify(paymentIntent)}`);
            return paymentIntent;
        }
        catch (error) {
            CustomLogger.error(`Error creating PaymentIntent: ${error.message}`);
            throw error;
        }
    }
    async confirmPaymentIntent(paymentIntentId, paymentMethodId) {
        try {
            const confirmedPaymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
                payment_method: paymentMethodId,
                off_session: true
            });
            CustomLogger.info(`Confirmed PaymentIntent: ${paymentIntentId}`);
            return confirmedPaymentIntent;
        }
        catch (error) {
            CustomLogger.error(`Error confirming PaymentIntent: ${error.message}`);
            throw new Error(`Failed to confirm PaymentIntent: ${error.message}`);
        }
    }
    async createPayout(amount, customerId) {
        try {
            // Simulate payout creation delay
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const simulatedPayout = {
                id: `po_simulated_${crypto.randomBytes(16).toString('hex')}`,
                status: 'paid',
                amount: amount * 100, // Convert to cents
                currency: 'usd',
                arrival_date: Math.floor(Date.now() / 1000) + 86400, // Set arrival date to 24 hours from now
                method: 'standard',
                type: 'bank_account'
            };
            CustomLogger.info(`Simulated payout for customer ${customerId}: ${JSON.stringify(simulatedPayout)}`);
            return simulatedPayout;
        }
        catch (error) {
            CustomLogger.error(`Error creating payout: ${error.message}`);
            throw new Error(`Failed to create payout: ${error.message}`);
        }
    }
    async listPaymentMethods(customerId) {
        try {
            const paymentMethods = await stripe.paymentMethods.list({
                customer: customerId,
                type: 'card'
            });
            CustomLogger.debug(`Retrieved ${paymentMethods.data.length} payment methods for customer ${customerId}`);
            return paymentMethods;
        }
        catch (error) {
            CustomLogger.error('Error listing payment methods:', error);
            throw new Error(`Failed to list payment methods: ${error.message}`);
        }
    }
    async retrievePaymentMethod(paymentMethodId) {
        try {
            const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
            CustomLogger.debug(`Retrieved payment method ${paymentMethodId}`);
            return paymentMethod;
        }
        catch (error) {
            CustomLogger.error(`Error retrieving payment method ${paymentMethodId}:`, error);
            throw new Error(`Failed to retrieve payment method: ${error.message}`);
        }
    }
    async detachPaymentMethod(paymentMethodId) {
        try {
            const detachedPaymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
            CustomLogger.info(`Detached payment method ${paymentMethodId}`);
            return detachedPaymentMethod;
        }
        catch (error) {
            CustomLogger.error(`Error detaching payment method ${paymentMethodId}:`, error);
            throw new Error(`Failed to detach payment method: ${error.message}`);
        }
    }
    // Kafka Actions
    handleReturnData(userData) {
        if (this.kafkaDataPromiseResolve) {
            this.kafkaDataPromiseResolve(userData);
            this.kafkaDataPromiseResolve = null;
        }
        else {
            CustomLogger.warn('Received user data, but no pending KYC submission');
        }
    }
}
