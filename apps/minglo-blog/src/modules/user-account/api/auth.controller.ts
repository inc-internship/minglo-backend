import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CreateUserInputDto,
  RegistrationConfirmationInputDto,
  RegistrationConfirmationResendInputDto,
} from './input-dto';
import {
  ConfirmEmailCommand,
  CreateUserCommand,
  ResendConfirmEmailCommand,
} from '../application/usecases';
import {
  ApiAuthLoginDecorator,
  ApiAuthLogoutDecorator,
  ApiAuthMeDecorator,
  ApiAuthRefreshTokenDecorator,
  ApiAuthRegistration,
  ApiAuthRegistrationConfirmation,
  ApiAuthRegistrationConfirmationResend,
} from '../../../core/decorators/swagger';
import { LoginUserInputDto } from './input-dto/login-user.input.dto';
import { LoginUserCommand } from '../application/usecases/auth/login-user.usecase';
import type { Response } from 'express';
import { LoginResult } from './types/login-result';
import { GetUserMetadata } from '../../../core/decorators/auth/user-agent.decorator';
import type { UserMetadata } from '../../../core/decorators/auth/user-agent.decorator';
import { UserConfig } from '../../../core/user.config';
import { LoggerService } from '@app/logger';
import { CurrentUser } from '../../../core/decorators/auth/current-user.decorator';
import { ActiveUserDto } from '../../../core/decorators/auth/dto/active-user.dto';
import { MeQuery } from '../application/usecases/auth/me.usecase';
import { AccessGuard } from '../guards/access.guard';
import { MeViewDto } from './view-dto/me-view.dto';
import { RefreshTokenCommand } from '../application/usecases/auth/refresh-token.usecase';
import { RefreshTokenResult } from './types/refresh-token-result';
import { RefreshGuard } from '../guards/refresh.guard';
import { LogOutCommand } from '../application/usecases/auth/logout.usecase';

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
  ): Promise<{ accessToken: string }> {
    const { refreshToken, accessToken } = await this.commandBus.execute<
      LoginUserCommand,
      LoginResult
    >(new LoginUserCommand(dto, meta));
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: this.userConfig.maxAgeRefreshToken * 1000,
    });
    this.logger.log('Login completed', 'Login');
    return { accessToken: accessToken };
  }

  @Get('me')
  @ApiAuthMeDecorator()
  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.OK)
  async me(@CurrentUser() user: ActiveUserDto): Promise<MeViewDto> {
    const result: MeViewDto = await this.queryBus.execute<MeQuery, MeViewDto>(new MeQuery(user));
    this.logger.log('Get UserData', 'Me');
    return result;
  }

  @Post('refresh-token')
  @ApiAuthRefreshTokenDecorator()
  @UseGuards(RefreshGuard)
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: ActiveUserDto,
  ): Promise<{ accessToken: string }> {
    const { refreshToken, accessToken } = await this.commandBus.execute<
      RefreshTokenCommand,
      RefreshTokenResult
    >(new RefreshTokenCommand(user));
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: this.userConfig.maxAgeRefreshToken * 1000,
    });
    this.logger.log('rotation refresh and access token completed', 'refresh-token');
    return { accessToken: accessToken };
  }

  @Post('logout')
  @ApiAuthLogoutDecorator()
  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: ActiveUserDto,
  ): Promise<void> {
    await this.commandBus.execute<LogOutCommand, void>(new LogOutCommand(user));
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    });
    this.logger.log(`user ${user.userId} logout', 'logout`);
  }
}
