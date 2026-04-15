import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PostsController } from './api/posts.controller';
import { MEDIA_ACCESS_TOKEN_STRATEGY_INJECT_TOKEN } from '@app/media/constants';
import { JwtService } from '@nestjs/jwt';
import { CoreConfig } from '../../core/core.config';
import { UploadPostImagesUseCase } from './application/usecases';

@Module({
  imports: [HttpModule],
  controllers: [PostsController],
  providers: [
    UploadPostImagesUseCase,
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
