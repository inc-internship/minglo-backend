import { Module } from '@nestjs/common';
import { CryptoService, UserService } from './application/services';
import { AuthController } from './api/auth.controller';
import {
  ConfirmEmailUseCase,
  CreateUserUseCase,
  ResendConfirmEmailUseCase,
} from './application/usecases';
import { UserFactory } from './domains';
import { EmailConfirmationRepository, UserRepository } from './infrastructure';
import { UserRegisteredHandler } from './application/events';
import { EmailModule } from '@app/notifications';
import { JwtService } from './application/services/jwt.service';
import { LoginUserUseCase } from './application/usecases/auth/login-user.usecase';

@Module({
  imports: [EmailModule],
  controllers: [AuthController],
  providers: [
    UserFactory,
    UserService,
    CryptoService,
    JwtService,
    UserRepository,
    EmailConfirmationRepository,
    CreateUserUseCase,
    LoginUserUseCase,
    UserRegisteredHandler,
    ConfirmEmailUseCase,
    ResendConfirmEmailUseCase,
  ],
})
export class UserAccountModule {}
