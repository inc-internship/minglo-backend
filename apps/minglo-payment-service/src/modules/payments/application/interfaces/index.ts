import {
  PaymentStatus,
  PaymentSystem,
  SubscriptionStatus,
} from 'apps/minglo-payment-service/prisma/generated/prisma';

export interface ICreateCheckoutSession {
  customerId: string;
  priceId: string;
  metadata: Record<string, string>;
}

export interface ICreateSubscriptionData {
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  paymentSystem: PaymentSystem;
  startDate: Date;
  endDate: Date;
  autoRenewal: boolean;
  stripePaymentMethodId: string;
  stripeCustomerId: string;
}

export interface ICreatePaymentData {
  userId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentSystem: PaymentSystem;
  externalPaymentId: string;
  rawProviderData: object;
  failureReason?: string;
}

export interface StripeWebhookResponse {
  received: boolean;
}
