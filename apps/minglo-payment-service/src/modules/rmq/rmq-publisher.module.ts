import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PaymentsConfig } from '../core/payments.config';
import { PAYMENTS_RMQ_CLIENT, RABBITMQ_QUEUES } from '@app/payments';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: PAYMENTS_RMQ_CLIENT,
        useFactory: (config: PaymentsConfig) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.rabbitmqUrl],
            queue: RABBITMQ_QUEUES.SUBSCRIPTION_ACTIVATED,
            queueOptions: {
              durable: true,
            },
          },
        }),
        inject: [PaymentsConfig],
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class RmqPublisherModule {}
