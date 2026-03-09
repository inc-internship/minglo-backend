import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DynamicConfigModule } from '@app/dynamic-config';

@Module({
  imports: [DynamicConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
