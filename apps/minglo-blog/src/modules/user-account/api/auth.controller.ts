import { Body, Controller, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
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
  ApiAuthRegistration,
  ApiAuthRegistrationConfirmation,
  ApiAuthRegistrationConfirmationResend,
} from '../../../core/decorators/swagger';
import { LoginUserInputDto } from './input-dto/login-user.input.dto';
import { LoginUserCommand } from '../application/usecases/auth/login-user.usecase';
import type { Response } from 'express';
import { LoginResult } from './types/login-result';
import { ApiLoginDecorator } from '../../../core/decorators/swagger/auth-login.decorator';
import { GetUserMetadata } from '../../../core/decorators/auth/user-agent.decorator';
import type { UserMetadata } from '../../../core/decorators/auth/user-agent.decorator';
import { UserConfig } from '../../../core/user.config';
import { LoggerService } from '@app/logger';
import { ApiAuthMeDecorator } from '../../../core/decorators/swagger/auth-me.decorator';
import { CurrentUser } from '../../../core/decorators/auth/current-user.decorator';
import { ActiveUserDto } from '../../../core/decorators/auth/dto/active-user.dto';
import { MeQuery } from '../application/usecases/auth/me.usecase';
import { AccessGuard } from '../guards/access.guard';

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
  @ApiLoginDecorator()
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

  @Post('me')
  @ApiAuthMeDecorator()
  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.OK)
  async me(@CurrentUser() user: ActiveUserDto) {
    const result = await this.queryBus.execute(new MeQuery(user));
    this.logger.log('Get UserData', 'Me');
    return result;
  }
}
