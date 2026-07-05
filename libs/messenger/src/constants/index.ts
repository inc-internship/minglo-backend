export const MESSENGER_SERVICE = 'MINGLO_MESSENGER_SERVICE';

export const MESSENGER_RMQ_CLIENT = 'MESSENGER_RMQ_CLIENT';

export const RABBITMQ_MESSENGER_QUEUES = {
  MESSAGE_SENT: 'message_sent',
} as const;

export const MESSENGER_EVENTS = {
  MESSAGE_SENT: 'messenger.message_sent',
} as const;
