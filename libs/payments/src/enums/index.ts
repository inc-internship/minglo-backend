export enum SubscriptionStatus {
  PENDING = 'PENDING', // куплена, но ещё не началась (стекинг)
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentSystem {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
}

export enum PaymentStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}
