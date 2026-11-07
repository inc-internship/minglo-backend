import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ThrottlerModule } from '@nestjs/throttler';
import { MessengerConfig } from './messenger.config';
import { PrismaMessengerModule } from '../database';

@Global()
@Module({
  imports: [
    CqrsModule,
    ThrottlerModule.forRootAsync({
      useFactory: (config: MessengerConfig) => [
        {
          ttl: config.throttleTtl,
          limit: config.throttleLimit,
        },
      ],
      inject: [MessengerConfig],
    }),
    PrismaMessengerModule,
  ],
  providers: [MessengerConfig],
  exports: [CqrsModule, ThrottlerModule, MessengerConfig, PrismaMessengerModule],
})
export class MessengerCoreModule {}
