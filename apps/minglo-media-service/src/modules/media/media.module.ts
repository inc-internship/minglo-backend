import { Module } from '@nestjs/common';
import { MediaController, MediaTcpController } from './api';
import { ImageProcessorService } from './application/services';
import {
  ConsumeMediaFilesUseCase,
  MarkMediaFilesDeletedUseCase,
  UploadImageUseCase,
} from './application/usecases';
import { S3StorageService } from '../storage/application/services';
import { MediaRepository } from './infrstructure';
import { MediaFileFactory } from './domains/factory/media-file.factory';
import { MEDIA_ACCESS_TOKEN_STRATEGY_INJECT_TOKEN } from '@app/media/constants';
import { MediaConfig } from '../core/media.config';
import { JwtService } from '@nestjs/jwt';
import { MediaJwtStrategy } from './guards/media-jwt.strategy';
import { SwaggerMediaTcpController } from './api/minglo-media-tcp.swagger-controller';
import { MediaFilesDBCleanupJob, MediaFilesS3CleanupJob } from './application/jobs';

@Module({
  imports: [],
  controllers: [MediaController, MediaTcpController, SwaggerMediaTcpController],
  providers: [
    S3StorageService,
    ImageProcessorService,
    UploadImageUseCase,
    MediaRepository,
    MediaFileFactory,
    ConsumeMediaFilesUseCase,
    MarkMediaFilesDeletedUseCase,
    MediaFilesS3CleanupJob,
    MediaFilesDBCleanupJob,
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
