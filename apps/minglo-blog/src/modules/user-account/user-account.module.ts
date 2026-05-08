import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UserMetaMiddleware } from './guards/middleware/user-meta.middleware';
import { CryptoService, UserService } from './application/services';
import { AuthController } from './api/auth.controller';
import {
  ConfirmEmailUseCase,
  CreateUserUseCase,
  DeleteSessionUseCase,
  LoginUserUseCase,
  LogoutUseCase,
  NewPasswordUseCase,
  OAuthLoginUseCase,
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
import { AccessStrategy, GithubStrategy, GoogleStrategy, RefreshStrategy } from './guards/strategy';
import { SessionFactory } from './domains/factories/session.factory';
import { DeviceService } from './application/services/device.service';
import { JwtModule } from '@nestjs/jwt';
import {
  GetDevicesHandler,
  GetTotalRegisteredUserCountQueryHandler,
  MeHandler,
} from './application/queries';
import { SessionQueryRepository, UserQueryRepository } from './infrastructure/queries';
import {
  PasswordRecoveryCodeCleanupJob,
  SessionCleanupJob,
  UsersCleanupJob,
} from './application/jobs';
import { SessionsController } from './api/sessions.controller';
import { RecaptchaService } from './application/services/recaptcha.service';
import { RecaptchaGuard } from './guards/captcha.guard';
import { HttpModule } from '@nestjs/axios';
import { UsersController } from './api/users.controller';
import { OAuthController } from './api/oauth.controller';
import { AuthService } from './application/services';

const services = [
  UserService,
  CryptoService,
  TokenService,
  SessionService,
  DeviceService,
  RecaptchaService,
  AuthService,
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
  OAuthLoginUseCase,
];

const repos = [
  UserRepository,
  SessionRepository,
  EmailConfirmationRepository,
  UserQueryRepository,
  SessionQueryRepository,
];

const queries = [GetTotalRegisteredUserCountQueryHandler, MeHandler];

const jobs = [UsersCleanupJob, PasswordRecoveryCodeCleanupJob, SessionCleanupJob];

const strategies = [AccessStrategy, RefreshStrategy, GoogleStrategy, GithubStrategy];

@Module({
  imports: [EmailModule, JwtModule.register({}), HttpModule],
  controllers: [AuthController, OAuthController, SessionsController, UsersController],
  providers: [
    ...services,
    ...usecases,
    ...repos,
    ...queries,
    ...strategies,
    UserFactory,
    RecaptchaGuard,
    SessionFactory,
    UserRegisteredHandler,
    MeHandler,
    GetDevicesHandler,
    PasswordRecoveryHandler,
    ...jobs,
  ],
  exports: [UserQueryRepository],
})
export class UserAccountModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(UserMetaMiddleware).forRoutes('*');
  }
}
