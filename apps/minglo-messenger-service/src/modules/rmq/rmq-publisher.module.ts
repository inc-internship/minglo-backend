import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MessengerConfig } from '../../core/messenger.config';
import { MESSENGER_RMQ_CLIENT, RABBITMQ_MESSENGER_QUEUES } from '@app/messenger';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: MESSENGER_RMQ_CLIENT,
        useFactory: (config: MessengerConfig) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.rabbitmqUrl],
            queue: RABBITMQ_MESSENGER_QUEUES.MESSAGE_SENT,
            queueOptions: { durable: true },
          },
        }),
        inject: [MessengerConfig],
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class RmqPublisherModule {}