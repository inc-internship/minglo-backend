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
      .set('x-forwarded-for', '127.0.0.1')
      .set('user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)')
      .send(dto)
      .expect(expectedStatus);
  }

  async me(token: string, statusCode: number = HttpStatus.OK): Promise<request.Response> {
    return request(this.app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(statusCode);
  }

  async refreshToken(
    cookie: string | string[],
    expectedStatus: number = HttpStatus.OK,
  ): Promise<request.Response> {
    const cookiesArray = Array.isArray(cookie) ? cookie : [cookie];

    const refreshCookie = cookiesArray.find((c) => c.startsWith('refreshToken='));
    const cleanCookie = refreshCookie ? refreshCookie.split(';')[0] : '';

    return request(this.app.getHttpServer())
      .post('/api/v1/auth/refresh-token')
      .set('Cookie', [cleanCookie])
      .send()
      .expect(expectedStatus);
  }
}
