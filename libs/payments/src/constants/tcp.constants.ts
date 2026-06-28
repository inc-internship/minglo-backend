export const PAYMENTS_TCP_PATTERNS = {
  GET_PLANS: 'get_plans',
  CREATE_STRIPE_CHECKOUT: 'create_stripe_checkout',
  STRIPE_WEBHOOK: 'stripe_webhook',
  GET_PAYMENT_HISTORY: 'get_payment_history',
  GET_CURRENT_SUBSCRIPTION: 'get_current_subscription',
  TOGGLE_AUTO_RENEWAL: 'toggle_auto_renewal',
  DELETE_USER_DATA: 'delete_user_data',
  GET_EXPIRING_SUBSCRIPTIONS: 'get_expiring_subscriptions',
} as const;
