import { Module } from '@nestjs/common';
import { MingloMediaServiceController } from './minglo-media-service.controller';
import { MingloMediaServiceService } from './minglo-media-service.service';

@Module({
  imports: [],
  controllers: [MingloMediaServiceController],
  providers: [MingloMediaServiceService],
})
export class MingloMediaServiceModule {}
