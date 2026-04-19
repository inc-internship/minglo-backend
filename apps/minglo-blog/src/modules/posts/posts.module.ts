import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PostsController } from './api/posts.controller';
import { MEDIA_ACCESS_TOKEN_STRATEGY_INJECT_TOKEN, MEDIA_SERVICE } from '@app/media/constants';
import { JwtService } from '@nestjs/jwt';
import { CoreConfig } from '../../core/core.config';
import {
  CreatePostUseCase,
  DeletePostUseCase,
  UpdatePostUseCase,
  UploadPostImagesUseCase,
} from './application/usecases';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PostsRepository } from './infrastructure/posts.repository';
import { UserAccountModule } from '../user-account/user-account.module';
import { GetPostByIdQueryHandler } from './application/query';
import { PostQueryRepository } from './infrastructure/query';
import { PostViewMapper } from './application/mappers';
import { PostsCleanupJob } from './application/jobs';

const usecases = [UploadPostImagesUseCase, CreatePostUseCase, UpdatePostUseCase, DeletePostUseCase];

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
    UserAccountModule,
  ],
  controllers: [PostsController],
  providers: [
    ...usecases,
    GetPostByIdQueryHandler,
    PostsRepository,
    PostQueryRepository,
    PostViewMapper,
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
    PostsCleanupJob,
  ],
})
export class PostsModule {}
