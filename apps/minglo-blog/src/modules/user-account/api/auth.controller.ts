import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CreateUserInputDto,
  LoginUserInputDto,
  PasswordRecoveryInputDto,
  RegistrationConfirmationInputDto,
  RegistrationConfirmationResendInputDto,
} from './input-dto';
import {
  ConfirmEmailCommand,
  CreateUserCommand,
  LoginUserCommand,
  LogoutCommand,
  PasswordRecoveryUseCaseCommand,
  RefreshTokenCommand,
  ResendConfirmEmailCommand,
} from '../application/usecases';
import {
  ApiAuthLoginDecorator,
  ApiAuthLogoutDecorator,
  ApiAuthMeDecorator,
  ApiAuthPasswordRecoveryDecorator,
  ApiAuthRefreshTokenDecorator,
  ApiAuthRegistration,
  ApiAuthRegistrationConfirmation,
  ApiAuthRegistrationConfirmationResend,
} from '../../../core/decorators/swagger';
import type { Response } from 'express';
import { LoginResult } from './types/login-result';
import type { UserMetadata } from '../../../core/decorators/auth/user-agent.decorator';
import { GetUserMetadata } from '../../../core/decorators/auth/user-agent.decorator';
import { UserConfig } from '../../../core/user.config';
import { LoggerService } from '@app/logger';
import { CurrentUser } from '../../../core/decorators/auth/current-user.decorator';
import { ActiveUserDto } from '../../../core/decorators/auth/dto';
import { AccessGuard } from '../guards/access.guard';
import { MeViewDto } from './view-dto/me-view.dto';
import { RefreshTokenResult } from './types/refresh-token-result';
import { RefreshGuard } from '../guards/refresh.guard';
import { MeQuery } from '../application/queries';
import { AccessTokenResponse } from './types';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private logger: LoggerService,
    private userConfig: UserConfig,
  ) {
    this.logger.setContext(AuthController.name);
  }

  @Post('registration')
  @ApiAuthRegistration()
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() body: CreateUserInputDto): Promise<void> {
    await this.commandBus.execute<CreateUserCommand, string>(new CreateUserCommand(body));
    this.logger.log('Registration completed', 'registration');
  }

  @Post('registration/confirmation')
  @ApiAuthRegistrationConfirmation()
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmRegistration(@Body() { code }: RegistrationConfirmationInputDto): Promise<void> {
    await this.commandBus.execute<ConfirmEmailCommand, string>(new ConfirmEmailCommand(code));
    this.logger.log('Email confirmation completed', 'confirmRegistration');
  }

  @Post('registration/confirmation/resend')
  @ApiAuthRegistrationConfirmationResend()
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendConfirmationEmail(
    @Body() { email, redirectUrl }: RegistrationConfirmationResendInputDto,
  ) {
    await this.commandBus.execute<ResendConfirmEmailCommand, void>(
      new ResendConfirmEmailCommand(email, redirectUrl),
    );
    this.logger.log('Confirmation email resent', 'resendConfirmationEmail');
  }

  @Post('login')
  @ApiAuthLoginDecorator()
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginUserInputDto,
    @Res({ passthrough: true }) res: Response,
    @GetUserMetadata() meta: UserMetadata,
  ): Promise<AccessTokenResponse> {
    const { refreshToken, accessToken } = await this.commandBus.execute<
      LoginUserCommand,
      LoginResult
    >(new LoginUserCommand(dto, meta));
    this.setRefreshTokenCookie(res, refreshToken);
    this.logger.log('User successfully logged into the app', 'Login');
    return { accessToken };
  }

  @Get('me')
  @ApiAuthMeDecorator()
  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.OK)
  async me(@CurrentUser() user: ActiveUserDto): Promise<MeViewDto> {
    this.logger.log('Get UserData', 'Me');
    return this.queryBus.execute(new MeQuery(user));
  }

  @Post('refresh-token')
  @ApiAuthRefreshTokenDecorator()
  @UseGuards(RefreshGuard)
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: ActiveUserDto,
  ): Promise<AccessTokenResponse> {
    const { refreshToken, accessToken } = await this.commandBus.execute<
      RefreshTokenCommand,
      RefreshTokenResult
    >(new RefreshTokenCommand(user));
    this.setRefreshTokenCookie(res, refreshToken);
    this.logger.log('rotation refresh and access token completed', 'refresh-token');
    return { accessToken };
  }

  @Post('logout')
  @ApiAuthLogoutDecorator()
  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: ActiveUserDto,
  ): Promise<void> {
    await this.commandBus.execute<LogoutCommand, void>(new LogoutCommand(user));
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    });
    this.logger.log(`user ${user.userId} logged out', 'logout`);
  }

  @Post('password-recovery')
  @ApiAuthPasswordRecoveryDecorator()
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() body: PasswordRecoveryInputDto): Promise<void> {
    await this.commandBus.execute<PasswordRecoveryUseCaseCommand, void>(
      new PasswordRecoveryUseCaseCommand(body),
    );
    this.logger.log(`Password-recovery success', 'password-recovery`);
  }

  /** Sets the refresh token as an httpOnly cookie on the response. */
  private setRefreshTokenCookie(res: Response, refreshToken: string): void {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: this.userConfig.maxAgeRefreshToken * 1000,
    });
  }
}
