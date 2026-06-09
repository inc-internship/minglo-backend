import Stripe from 'stripe';
import { Injectable } from '@nestjs/common';
import { PaymentsConfig } from '../core/payments.config';
import { LoggerService } from '@app/logger';
import { ICreateCheckoutSession } from '../payments/application/interfaces';

@Injectable()
export class StripeService {
  private stripe: ReturnType<typeof Stripe>;

  constructor(
    private readonly config: PaymentsConfig,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(StripeService.name);
  }

  onModuleInit() {
    this.stripe = new Stripe(this.config.stripeSecretKey, {
      apiVersion: '2026-04-22.dahlia',
    });
    this.logger.log('Stripe client initialized', 'onModuleInit');
  }

  // Creates new customer in Stripe, required for off-session payments.
  async createCustomer(userId: string) {
    this.logger.log(`Creating Stripe customer for userId: ${userId}`, 'createCustomer');
    return this.stripe.customers.create({
      metadata: { userId },
    });
  }

  // Creates Stripe Checkout Session (payment page), mode: 'payment'.
  async createCheckoutSession(params: ICreateCheckoutSession) {
    this.logger.log(
      `Creating checkout session for customerId: ${params.customerId}`,
      'createCheckoutSession',
    );
    return this.stripe.checkout.sessions.create({
      customer: params.customerId,
      mode: 'payment',
      line_items: [{ price: params.priceId, quantity: 1 }],
      payment_intent_data: {
        setup_future_usage: 'off_session', //saves user's card for future payments,
        metadata: params.metadata,
      },
      metadata: params.metadata,
      success_url: `${this.config.frontendUrl}/profile/account?payment=success`,
      cancel_url: `${this.config.frontendUrl}/profile/account?payment=cancelled`,
    });
  }

  // Stripe signature verification
  constructWebhookEvent(rawBody: Buffer, signature: string) {
    return this.stripe.webhooks.constructEvent(rawBody, signature, this.config.webHookSecret);
  }

  /**
   * Retrieves a PaymentIntent with expanded payment method details for subscription renewals.
   */
  async getPaymentIntent(id: string) {
    this.logger.log(`Retrieving PaymentIntent: ${id}`, 'getPaymentIntent');
    return this.stripe.paymentIntents.retrieve(id, {
      expand: ['payment_method'],
    });
  }
}
