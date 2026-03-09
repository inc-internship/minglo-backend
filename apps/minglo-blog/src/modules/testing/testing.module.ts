import { Module } from '@nestjs/common';
import { MingloTestController } from './api/testing.controller';

@Module({
  imports: [],
  controllers: [MingloTestController],
  providers: [],
  exports: [],
})
export class MingloTestModule {}
