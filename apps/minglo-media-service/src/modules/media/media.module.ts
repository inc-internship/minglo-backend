import { Module } from '@nestjs/common';
import { MediaController } from './api';
import { ImageProcessorService } from './application/services';
import { UploadImageUseCase } from './application/usecases';
import { S3StorageService } from '../storage/application/services';
import { MediaRepository } from './infrstructure/media.repository';
import { MediaFileFactory } from './domains/factory/media-file.factory';

@Module({
  imports: [],
  controllers: [MediaController],
  providers: [
    S3StorageService,
    ImageProcessorService,
    UploadImageUseCase,
    MediaRepository,
    MediaFileFactory,
  ],
})
export class MediaModule {}
