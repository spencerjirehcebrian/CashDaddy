import Stripe from 'stripe';

export interface IStripeService {
  createCustomer(email: string): Promise<Stripe.Customer>;
}
