import Stripe from 'stripe';
import { CustomLogger, NotFoundError } from '@cash-daddy/shared';
import { config } from '../../config/index.js';
// import crypto from 'crypto';
const stripe = new Stripe(config.STRIPE_SECRET_KEY);
export class StripeService {
    constructor(kafkaProducer) {
        this.kafkaProducer = kafkaProducer;
        this.kafkaDataPromiseResolve = null;
    }
    async createCustomer(userId) {
        try {
            try {
                await this.kafkaProducer.send({
                    topic: 'user-events',
                    messages: [
                        {
                            value: JSON.stringify({
                                action: 'getUserWallet',
                                payload: { userId }
                            })
                        }
                    ]
                });
                const userData = await new Promise((resolve) => {
                    this.kafkaDataPromiseResolve = resolve;
                    setTimeout(() => {
                        if (this.kafkaDataPromiseResolve) {
                            this.kafkaDataPromiseResolve(null);
                            this.kafkaDataPromiseResolve = null;
                        }
                    }, 10000);
                });
                if (!userData) {
                    throw new NotFoundError('User cannot be verified');
                }
                // Create a new customer in Stripe
                const customerData = {
                    email: userData.email,
                    name: `${userData.firstName} ${userData.lastName}`.trim(),
                    address: {
                        line1: userData.userProfile.addressLine1,
                        ...(userData.userProfile.addressLine2 && { line2: userData.userProfile.addressLine2 }),
                        city: userData.userProfile.city,
                        state: userData.userProfile.state,
                        postal_code: userData.userProfile.postalCode,
                        country: userData.userProfile.country
                    },
                    metadata: { userId: userData.id }
                };
                const customer = await stripe.customers.create(customerData);
                await this.kafkaProducer.send({
                    topic: 'user-events',
                    messages: [
                        {
                            value: JSON.stringify({
                                action: 'updateUserStripeCustomer',
                                payload: { userId, stripeCustomerId: customer.id }
                            })
                        }
                    ]
                });
                const userDataCheck = await new Promise((resolve) => {
                    this.kafkaDataPromiseResolve = resolve;
                    setTimeout(() => {
                        if (this.kafkaDataPromiseResolve) {
                            this.kafkaDataPromiseResolve(null);
                            this.kafkaDataPromiseResolve = null;
                        }
                    }, 10000);
                });
                if (!userDataCheck) {
                    throw new NotFoundError('User update cannot be verified');
                }
                CustomLogger.info(`Stripe customer created for user ${userId} with ID ${customer.id}`);
                return customer;
            }
            catch (error) {
                CustomLogger.error('Error creating Stripe customer', error);
                throw error;
            }
        }
        catch (error) {
            CustomLogger.error(`Error creating Stripe customer: ${error.message}`);
            throw new Error(`Failed to create Stripe customer: ${error.message}`);
        }
    }
    // Kafka Actions
    handleReturnData(userData) {
        if (this.kafkaDataPromiseResolve) {
            this.kafkaDataPromiseResolve(userData);
            this.kafkaDataPromiseResolve = null;
        }
        else {
            CustomLogger.warn('Received kafka data, but no pending action or empty data');
        }
    }
}
