import { Module } from '@nestjs/common';
import { MediaController } from './api';
import { ImageProcessorService } from './application/services';
import { UploadImageUseCase } from './application/usecases';
import { S3StorageService } from '../storage/application/services';
import { MediaRepository } from './infrstructure/media.repository';
import { MediaFileFactory } from './domains/factory/media-file.factory';
import { MEDIA_ACCESS_TOKEN_STRATEGY_INJECT_TOKEN } from '@app/media/constants';
import { MediaConfig } from '../core/media.config';
import { JwtService } from '@nestjs/jwt';
import { MediaJwtStrategy } from './guards/media-jwt.strategy';

@Module({
  imports: [],
  controllers: [MediaController],
  providers: [
    S3StorageService,
    ImageProcessorService,
    UploadImageUseCase,
    MediaRepository,
    MediaFileFactory,
    {
      provide: MEDIA_ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (config: MediaConfig): JwtService => {
        return new JwtService({
          secret: config.accessSecret,
          signOptions: { expiresIn: config.accessTokenExpIn },
        });
      },
      inject: [MediaConfig],
    },
    MediaJwtStrategy,
  ],
})
export class MediaModule {}
