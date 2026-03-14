import { Module } from '@nestjs/common';
import { UserService } from './application/services/user.service';
import { AuthController } from './api/auth.controller';
import { CreateUserUseCase, ConfirmEmailUseCase } from './application/usecases';
import { UserFactory } from './domains';
import { CryptoService } from './application/services/crypto.service';
import { UserRepository } from './infrastructure/user.repository';
import { UserRegisteredHandler } from './application/events/user-registered.handler';
import { EmailModule } from '@app/notifications';

@Module({
  imports: [EmailModule],
  controllers: [AuthController],
  providers: [
    UserFactory,
    UserService,
    CryptoService,
    UserRepository,
    CreateUserUseCase,
    UserRegisteredHandler,
    ConfirmEmailUseCase,
  ],
})
export class UserAccountModule {}
