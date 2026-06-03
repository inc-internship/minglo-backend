import { Global, Module } from '@nestjs/common';
import { PrismaMediaService } from './prisma-media.service';

@Global()
@Module({
  providers: [PrismaMediaService],
  exports: [PrismaMediaService],
})
export class PrismaMediaModule {}
