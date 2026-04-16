import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PostsController } from './api/posts.controller';
import { MEDIA_ACCESS_TOKEN_STRATEGY_INJECT_TOKEN, MEDIA_SERVICE } from '@app/media/constants';
import { JwtService } from '@nestjs/jwt';
import { CoreConfig } from '../../core/core.config';
import { CreatePostUseCase, UploadPostImagesUseCase } from './application/usecases';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    HttpModule,
    ClientsModule.registerAsync([
      {
        name: MEDIA_SERVICE,
        useFactory: (config: CoreConfig) => ({
          transport: Transport.TCP,
          options: {
            host: config.mediaTcpHost,
            port: config.mediaTcpPort,
          },
        }),
        inject: [CoreConfig],
      },
    ]),
  ],
  controllers: [PostsController],
  providers: [
    UploadPostImagesUseCase,
    CreatePostUseCase,
    {
      provide: MEDIA_ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (config: CoreConfig): JwtService => {
        return new JwtService({
          secret: config.mediaAccessSecret,
          signOptions: { expiresIn: config.mediaAccessTokenExpIn },
        });
      },
      inject: [CoreConfig],
    },
  ],
})
export class PostsModule {}
