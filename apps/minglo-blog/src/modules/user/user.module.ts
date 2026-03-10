import { Module } from '@nestjs/common';
import { UserService } from './application/services/user.service';
import { UserController } from './api/user.controller';

@Module({
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
