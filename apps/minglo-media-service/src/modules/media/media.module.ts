import { Module } from '@nestjs/common';
import { MediaController } from './api';
import { MediaService } from './application/services';
import { UploadImageUseCase } from './application/usecases/upload-image.usecase';
import { S3StorageService } from '../storage/application/services';

@Module({
  imports: [],
  controllers: [MediaController],
  providers: [MediaService, UploadImageUseCase, S3StorageService],
})
export class MediaModule {}
