import { ThrottlerModule } from '@nestjs/throttler';
import { CqrsModule } from '@nestjs/cqrs';
import { Global, Module } from '@nestjs/common';
import { MediaConfig } from './media.config';
import { PrismaMediaModule } from '../../database';

@Global()
@Module({
  imports: [
    CqrsModule,
    ThrottlerModule.forRootAsync({
      useFactory: (config: MediaConfig) => [
        {
          ttl: config.throttleTtl,
          limit: config.throttleLimit,
        },
      ],
      inject: [MediaConfig],
    }),
    PrismaMediaModule,
  ],
  providers: [MediaConfig],
  exports: [CqrsModule, ThrottlerModule, MediaConfig, PrismaMediaModule],
})
export class MediaCoreModule {}
