import { Module } from '@nestjs/common';
import { MessengerTestController } from './api/testing.controller';

@Module({
  imports: [],
  controllers: [MessengerTestController],
  providers: [],
  exports: [],
})
export class MessengerTestModule {}
