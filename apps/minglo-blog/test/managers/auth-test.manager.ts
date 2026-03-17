import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  CreateUserInputDto,
  RegistrationConfirmationInputDto,
  RegistrationConfirmationResendInputDto,
} from '../../src/modules/user-account/api/input-dto';
import { LoginUserInputDto } from '../../src/modules/user-account/api/input-dto/login-user.input.dto';

export class AuthTestManager {
  constructor(private readonly app: INestApplication) {}

  async register(
    dto: Partial<CreateUserInputDto>,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<request.Response> {
    return request(this.app.getHttpServer())
      .post('/api/v1/auth/registration')
      .send(dto)
      .expect(statusCode);
  }

  async confirmRegistration(
    dto: Partial<RegistrationConfirmationInputDto>,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<request.Response> {
    return request(this.app.getHttpServer())
      .post('/api/v1/auth/registration/confirmation')
      .send(dto)
      .expect(statusCode);
  }

  async resendConfirmationEmail(
    dto: Partial<RegistrationConfirmationResendInputDto>,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<request.Response> {
    return request(this.app.getHttpServer())
      .post('/api/v1/auth/registration/confirmation/resend')
      .send(dto)
      .expect(statusCode);
  }

  validDto(overrides: Partial<CreateUserInputDto> = {}): CreateUserInputDto {
    return {
      login: 'validUser1',
      email: 'valid@gmail.com',
      password: 'Qwerty123',
      redirectUrl: 'https://minglo.blog/auth/confirm',
      ...overrides,
    };
  }

  async login(
    dto: LoginUserInputDto,
    expectedStatus: number = HttpStatus.OK,
  ): Promise<request.Response> {
    return request(this.app.getHttpServer())
      .post('/api/v1/auth/login')
      .send(dto)
      .expect(expectedStatus);
  }
}
