import { Module } from '@nestjs/common';
import { MicroAppController } from './micro-app.controller';
import { MicroAppService } from './micro-app.service';

@Module({
  imports: [],
  controllers: [MicroAppController],
  providers: [MicroAppService],
})
export class MicroAppModule {}
