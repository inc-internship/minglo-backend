import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
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

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private userConfig: UserConfig,
  ) {}

  @Post('registration')
  @ApiAuthRegistration()
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() body: CreateUserInputDto): Promise<void> {
    await this.commandBus.execute<CreateUserCommand, string>(new CreateUserCommand(body));
  }

  @Post('registration/confirmation')
  @ApiAuthRegistrationConfirmation()
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmRegistration(@Body() { code }: RegistrationConfirmationInputDto): Promise<void> {
    await this.commandBus.execute<ConfirmEmailCommand, string>(new ConfirmEmailCommand(code));
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
    return { accessToken: accessToken };
  }
}
