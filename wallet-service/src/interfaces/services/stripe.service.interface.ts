import Stripe from 'stripe';

export interface IStripeService {
  createCustomer(email: string): Promise<Stripe.Customer>;

  attachPaymentMethodToCustomer(paymentMethodId: string, customerId: string): Promise<Stripe.PaymentMethod>;

  createPaymentIntent(amount: number, currency: string, customerId: string, paymentMethodId: string): Promise<Stripe.PaymentIntent>;

  confirmPaymentIntent(paymentIntentId: string, paymentMethodId: string): Promise<Stripe.PaymentIntent>;

  createPayout(amount: number, customerId: string): Promise<Stripe.Payout>;

  listPaymentMethods(customerId: string): Promise<Stripe.ApiList<Stripe.PaymentMethod>>;

  retrievePaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod>;

  detachPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod>;
}
