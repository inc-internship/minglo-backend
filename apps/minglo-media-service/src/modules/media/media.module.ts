import { Module } from '@nestjs/common';
import { MediaController } from './api';
import { MediaService } from './application/services';

@Module({
  imports: [],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule {}
