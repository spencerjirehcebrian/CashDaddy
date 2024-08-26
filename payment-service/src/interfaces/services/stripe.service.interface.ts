import Stripe from 'stripe';

export interface IStripeService {
  attachPaymentMethodToCustomer(paymentMethodId: string, customerId: string): Promise<Stripe.PaymentMethod>;

  createPaymentIntent(amount: number, currency: string, customerId: string, paymentMethodId: string): Promise<Stripe.PaymentIntent>;

  createPaymentIntentAuto(amount: number, currency: string, customerId: string, paymentMethodId: string): Promise<Stripe.PaymentIntent>;

  confirmPaymentIntent(paymentIntentId: string, paymentMethodId: string): Promise<Stripe.PaymentIntent>;

  createPayout(amount: number, customerId: string): Promise<{ id: string; status: string; amount: number }>;

  listPaymentMethods(customerId: string): Promise<Stripe.ApiList<Stripe.PaymentMethod>>;

  retrievePaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod>;

  detachPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod>;
}
