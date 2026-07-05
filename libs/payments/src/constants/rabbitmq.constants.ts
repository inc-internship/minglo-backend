export const RABBITMQ_QUEUES = {
  SUBSCRIPTION_ACTIVATED: 'subscription_activated',
  SUBSCRIPTION_PENDING: 'subscription_pending',
} as const;

export const SUBSCRIPTION_EVENTS = {
  ACTIVATED: 'subscription.activated',
  PENDING: 'subscription.pending',
} as const;

export const PAYMENTS_RMQ_CLIENT = 'PAYMENTS_RMQ_CLIENT';
