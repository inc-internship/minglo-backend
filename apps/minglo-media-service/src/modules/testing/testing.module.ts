import { Module } from '@nestjs/common';
import { MediaTestController } from './api/testing.controller';

@Module({
  imports: [],
  controllers: [MediaTestController],
  providers: [],
  exports: [],
})
export class MediaTestModule {}
