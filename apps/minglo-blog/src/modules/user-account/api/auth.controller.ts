import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  CreateUserInputDto,
  RegistrationConfirmationInputDto,
  RegistrationConfirmationResendInputDto,
} from './input-dto';
import { ConfirmEmailCommand, CreateUserCommand } from '../application/usecases';
import {
  ApiAuthRegistration,
  ApiAuthRegistrationConfirmation,
  ApiAuthRegistrationConfirmationResend,
} from '../../../core/decorators/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

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
  async resendConfirmationEmail(@Body() { email }: RegistrationConfirmationResendInputDto) {
    console.log(email);

    return 'registration/confirmation/resend';
  }
}
