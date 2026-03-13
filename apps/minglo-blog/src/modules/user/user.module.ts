import { Module } from '@nestjs/common';
import { UserService } from './application/services/user.service';
import { UserController } from './api/user.controller';
import { AuthController } from './api/auth.controller';

@Module({
  controllers: [UserController, AuthController],
  providers: [UserService],
})
export class UserModule {}
