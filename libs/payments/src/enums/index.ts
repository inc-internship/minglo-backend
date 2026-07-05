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

export enum PaymentSortField {
  USERNAME_ASC = 'USERNAME_ASC',
  USERNAME_DESC = 'USERNAME_DESC',
  DATE_ASC = 'DATE_ASC',
  DATE_DESC = 'DATE_DESC',
  AMOUNT_ASC = 'AMOUNT_ASC',
  AMOUNT_DESC = 'AMOUNT_DESC',
  PAYMENT_METHOD_ASC = 'PAYMENT_METHOD_ASC',
  PAYMENT_METHOD_DESC = 'PAYMENT_METHOD_DESC',
}
