import { Module } from '@nestjs/common';
import { MediaController } from './api';
import { ImageProcessorService, MediaService } from './application/services';
import { UploadImageUseCase } from './application/usecases/upload-image.usecase';
import { S3StorageService } from '../storage/application/services';

const services = [MediaService, S3StorageService, ImageProcessorService];

@Module({
  imports: [],
  controllers: [MediaController],
  providers: [...services, UploadImageUseCase],
})
export class MediaModule {}
