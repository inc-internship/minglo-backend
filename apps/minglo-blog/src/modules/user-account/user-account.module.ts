import { Module } from '@nestjs/common';
import { UserService } from './application/services/user.service';
import { AuthController } from './api/auth.controller';
import { CreateUserUseCase } from './application/usecases';
import { UserFactory } from './domains';
import { CryptoService } from './application/services/crypto.service';
import { UserRepository } from './infrastructure/user.repository';

@Module({
  controllers: [AuthController],
  providers: [UserFactory, UserService, CryptoService, UserRepository, CreateUserUseCase],
})
export class UserAccountModule {}
