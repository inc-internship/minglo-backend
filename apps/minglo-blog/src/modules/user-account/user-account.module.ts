import { Module } from '@nestjs/common';
import { CryptoService, UserService } from './application/services';
import { AuthController } from './api/auth.controller';
import {
  ConfirmEmailUseCase,
  CreateUserUseCase,
  LoginUserUseCase,
  LogoutUsecase,
  NewPasswordUseCase,
  PasswordRecoveryUseCase,
  RefreshTokenUseCase,
  ResendConfirmEmailUseCase,
} from './application/usecases';
import { UserFactory } from './domains';
import { EmailConfirmationRepository, UserRepository } from './infrastructure';
import { PasswordRecoveryHandler, UserRegisteredHandler } from './application/events';
import { EmailModule } from '@app/notifications';
import { SessionRepository } from './infrastructure/session.repository';
import { TokenService } from './application/services/token.service';
import { SessionService } from './application/services/session.service';
import { AccessStrategy, RefreshStrategy } from './guards/strategy';
import { SessionFactory } from './domains/factories/session.factory';
import { DeviceService } from './application/services/device.service';
import { JwtModule } from '@nestjs/jwt';
import { MeQueryHandler } from './application/queries';
import { UserQueryRepository } from './infrastructure/queries/user.query.repository';
import { UsersCleanupJob } from './application/jobs';

const services = [UserService, CryptoService, TokenService, SessionService, DeviceService];

const usecases = [
  CreateUserUseCase,
  LoginUserUseCase,
  ConfirmEmailUseCase,
  ResendConfirmEmailUseCase,
  LoginUserUseCase,
  RefreshTokenUseCase,
  LogoutUsecase,
  PasswordRecoveryUseCase,
  NewPasswordUseCase,
];

const repos = [UserRepository, SessionRepository, EmailConfirmationRepository, UserQueryRepository];

const jobs = [UsersCleanupJob];

@Module({
  imports: [EmailModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    ...services,
    ...usecases,
    ...repos,
    UserFactory,
    SessionFactory,
    AccessStrategy,
    RefreshStrategy,
    UserRegisteredHandler,
    MeQueryHandler,
    PasswordRecoveryHandler,
    ...jobs,
  ],
})
export class UserAccountModule {}
