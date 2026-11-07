import { Global, Module } from '@nestjs/common';
import { PrismaMessengerService } from './prisma-messenger.service';

@Global()
@Module({
  providers: [PrismaMessengerService],
  exports: [PrismaMessengerService],
})
export class PrismaMessengerModule {}
