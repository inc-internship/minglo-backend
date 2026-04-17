import { Module } from '@nestjs/common';
import { CryptoService, UserService } from './application/services';
import { AuthController } from './api/auth.controller';
import {
  ConfirmEmailUseCase,
  CreateUserUseCase,
  DeleteSessionUseCase,
  LoginUserUseCase,
  LogoutUseCase,
  NewPasswordUseCase,
  PasswordRecoveryUseCase,
  RefreshTokenUseCase,
  ResendConfirmEmailUseCase,
  TerminateAllOtherSessionsUseCase,
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
import { MeHandler } from './application/queries';
import { UserQueryRepository } from './infrastructure/queries/user.query.repository';
import {
  PasswordRecoveryCodeCleanupJob,
  SessionCleanupJob,
  UsersCleanupJob,
} from './application/jobs';
import { SessionsController } from './api/sessions.controller';
import { GetDevicesHandler } from './application/queries/get-devices.query';
import { SessionQueryRepository } from './infrastructure/queries/session.query.repository';
import { RecaptchaService } from './application/services/recaptcha.service';
import { RecaptchaGuard } from './guards/captcha.guard';
import { HttpModule } from '@nestjs/axios';

const services = [
  UserService,
  CryptoService,
  TokenService,
  SessionService,
  DeviceService,
  RecaptchaService,
];

const usecases = [
  NewPasswordUseCase,
  CreateUserUseCase,
  LoginUserUseCase,
  ConfirmEmailUseCase,
  ResendConfirmEmailUseCase,
  LoginUserUseCase,
  RefreshTokenUseCase,
  LogoutUseCase,
  PasswordRecoveryUseCase,
  NewPasswordUseCase,
  DeleteSessionUseCase,
  TerminateAllOtherSessionsUseCase,
];

const repos = [
  UserRepository,
  SessionRepository,
  EmailConfirmationRepository,
  UserQueryRepository,
  SessionQueryRepository,
];

const jobs = [UsersCleanupJob, PasswordRecoveryCodeCleanupJob, SessionCleanupJob];

@Module({
  imports: [EmailModule, JwtModule.register({}), HttpModule],
  controllers: [AuthController, SessionsController],
  providers: [
    ...services,
    ...usecases,
    ...repos,
    UserFactory,
    RecaptchaGuard,
    SessionFactory,
    AccessStrategy,
    RefreshStrategy,
    UserRegisteredHandler,
    MeHandler,
    GetDevicesHandler,
    PasswordRecoveryHandler,
    ...jobs,
  ],
  exports: [UserQueryRepository],
})
export class UserAccountModule {}
