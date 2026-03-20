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
import { LoginUserUseCase } from './application/usecases/auth/login-user.usecase';
import { SessionRepository } from './infrastructure/session.repository';
import { TokenService } from './application/services/token.service';
import { SessionService } from './application/services/session.service';
import { AccessStrategy } from './guards/strategy/access.strategy';
import { SessionFactory } from './domains/factories/session.factory';
import { DeviceService } from './application/services/device.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [EmailModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    UserFactory,
    UserService,
    CryptoService,
    UserRepository,
    SessionRepository,
    TokenService,
    SessionService,
    AccessStrategy,
    DeviceService,
    SessionFactory,
    EmailConfirmationRepository,
    CreateUserUseCase,
    LoginUserUseCase,
    UserRegisteredHandler,
    ConfirmEmailUseCase,
    ResendConfirmEmailUseCase,
  ],
})
export class UserAccountModule {}
