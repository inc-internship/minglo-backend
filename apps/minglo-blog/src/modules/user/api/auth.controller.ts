import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CreateUserInputDto } from './input-dto/create-user.input-dto';

@Controller('auth')
export class AuthController {
  constructor() {
    // private readonly commandBus: CommandBus
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() body: CreateUserInputDto) {
    console.log(body);
    // return this.commandBus.execute<any, void>(new RegisterUserCommand(body));
  }
}
