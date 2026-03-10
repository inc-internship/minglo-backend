import { nestDynamicConfigModule } from '@app/dynamic-config/nest-dynamic-config-module';
import { Module } from '@nestjs/common';

@Module({
  imports: [nestDynamicConfigModule],
  providers: [],
  exports: [],
})
export class DynamicConfigModule {}
