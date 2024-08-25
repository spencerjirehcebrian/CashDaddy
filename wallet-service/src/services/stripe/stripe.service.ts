import Stripe from 'stripe';
import { CustomLogger, IUser, NotFoundError } from '@cash-daddy/shared';
import { config } from '../../config/index.js';
import { IStripeService } from '../../interfaces/services/stripe.service.interface.js';
import { Producer } from 'kafkajs';

const stripe = new Stripe(config.STRIPE_SECRET_KEY!);

export class StripeService implements IStripeService {
  private kafkaDataPromiseResolve: ((value: unknown) => void) | null = null;

  constructor(private kafkaProducer: Producer) {}
  async createCustomer(userId: string): Promise<Stripe.Customer> {
    try {
      try {
        await this.kafkaProducer.send({
          topic: 'user-events',
          messages: [
            {
              value: JSON.stringify({
                action: 'getUser',
                payload: { userId }
              })
            }
          ]
        });

        const userData: IUser | null = await new Promise((resolve) => {
          this.kafkaDataPromiseResolve = resolve as (value: unknown) => void;
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
        const customerData: Stripe.CustomerCreateParams = {
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

        const userDataCheck: IUser | null = await new Promise((resolve) => {
          this.kafkaDataPromiseResolve = resolve as (value: unknown) => void;
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
      } catch (error) {
        CustomLogger.error('Error creating Stripe customer', error);
        throw error;
      }
    } catch (error) {
      CustomLogger.error(`Error creating Stripe customer: ${(error as Error).message}`);
      throw new Error(`Failed to create Stripe customer: ${(error as Error).message}`);
    }
  }

  async attachPaymentMethodToCustomer(paymentMethodId: string, customerId: string): Promise<Stripe.PaymentMethod> {
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
    } catch (error) {
      CustomLogger.error(`Error in attachPaymentMethodToCustomer: ${(error as Error).message}`);
      CustomLogger.error(`Error details: ${JSON.stringify(error)}`);
      throw new Error(`Failed to attach payment method: ${(error as Error).message}`);
    }
  }

  async createPaymentIntent(amount: number, currency: string, customerId: string, paymentMethodId: string): Promise<Stripe.PaymentIntent> {
    CustomLogger.info(
      `Creating PaymentIntent: amount=${amount}, currency=${currency}, customerId=${customerId}, paymentMethodId=${paymentMethodId}`
    );

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        customer: customerId,
        payment_method: paymentMethodId,
        setup_future_usage: 'off_session'
      });

      CustomLogger.info(`PaymentIntent created: ${JSON.stringify(paymentIntent)}`);
      return paymentIntent;
    } catch (error) {
      CustomLogger.error(`Error creating PaymentIntent: ${(error as Error).message}`);
      throw error;
    }
  }

  async confirmPaymentIntent(paymentIntentId: string, paymentMethodId: string): Promise<Stripe.PaymentIntent> {
    try {
      const confirmedPaymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId
      });
      CustomLogger.info(`Confirmed PaymentIntent: ${paymentIntentId}`);
      return confirmedPaymentIntent;
    } catch (error) {
      CustomLogger.error(`Error confirming PaymentIntent: ${(error as Error).message}`);
      throw new Error(`Failed to confirm PaymentIntent: ${(error as Error).message}`);
    }
  }

  async createPayout(amount: number, customerId: string): Promise<Stripe.Payout> {
    try {
      // Note: In a real-world scenario, you'd typically use a connected account for payouts
      // This is a simplified version for demonstration purposes
      const payout = await stripe.payouts.create(
        {
          amount: amount * 100, // Convert to cents
          currency: 'usd',
          method: 'instant'
        },
        {
          stripeAccount: customerId // This assumes the customer ID can be used as a connected account ID, which is not typically the case
        }
      );
      CustomLogger.info(`Created payout for customer ${customerId}: ${JSON.stringify(payout)}`);
      return payout;
    } catch (error) {
      CustomLogger.error(`Error creating payout: ${(error as Error).message}`);
      throw new Error(`Failed to create payout: ${(error as Error).message}`);
    }
  }

  async listPaymentMethods(customerId: string): Promise<Stripe.ApiList<Stripe.PaymentMethod>> {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card'
      });
      CustomLogger.debug(`Retrieved ${paymentMethods.data.length} payment methods for customer ${customerId}`);
      return paymentMethods;
    } catch (error) {
      CustomLogger.error('Error listing payment methods:', error);
      throw new Error(`Failed to list payment methods: ${(error as Error).message}`);
    }
  }

  async retrievePaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    try {
      const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
      CustomLogger.debug(`Retrieved payment method ${paymentMethodId}`);
      return paymentMethod;
    } catch (error) {
      CustomLogger.error(`Error retrieving payment method ${paymentMethodId}:`, error);
      throw new Error(`Failed to retrieve payment method: ${(error as Error).message}`);
    }
  }

  async detachPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    try {
      const detachedPaymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
      CustomLogger.info(`Detached payment method ${paymentMethodId}`);
      return detachedPaymentMethod;
    } catch (error) {
      CustomLogger.error(`Error detaching payment method ${paymentMethodId}:`, error);
      throw new Error(`Failed to detach payment method: ${(error as Error).message}`);
    }
  }

  // Kafka Actions
  handleReturnData(userData: unknown): void {
    if (this.kafkaDataPromiseResolve) {
      this.kafkaDataPromiseResolve(userData);
      this.kafkaDataPromiseResolve = null;
    } else {
      CustomLogger.warn('Received user data, but no pending KYC submission');
    }
  }
}
