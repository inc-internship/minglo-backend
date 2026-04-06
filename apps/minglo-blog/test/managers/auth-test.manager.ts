import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  CreateUserInputDto,
  LoginUserInputDto,
  PasswordRecoveryInputDto,
  RegistrationConfirmationInputDto,
  RegistrationConfirmationResendInputDto,
} from '../../src/modules/user-account/api/input-dto';
import { NewPasswordInputDto } from '../../src/modules/user-account/api/input-dto/new-password.input-dto';

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
    metaData: { ip?: string; userAgent?: string } = {},
  ): Promise<request.Response> {
    const ip = metaData.ip ?? '127.0.0.1';
    const ua = metaData.userAgent ?? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
    return request(this.app.getHttpServer())
      .post('/api/v1/auth/login')
      .set('x-forwarded-for', ip)
      .set('user-agent', ua)
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

  async logout(
    accessToken: string,
    cookie: string | string[],
    expectedStatus: number = HttpStatus.NO_CONTENT,
  ): Promise<request.Response> {
    const cookiesArray = Array.isArray(cookie) ? cookie : [cookie];

    const refreshCookie = cookiesArray.find((c) => c.startsWith('refreshToken='));
    const cleanCookie = refreshCookie ? refreshCookie.split(';')[0] : '';

    return request(this.app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Cookie', [cleanCookie])
      .send()
      .expect(expectedStatus);
  }

  async passwordRecovery(
    dto: PasswordRecoveryInputDto,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<request.Response> {
    return request(this.app.getHttpServer())
      .post('/api/v1/auth/password-recovery')
      .send(dto)
      .expect(statusCode);
  }

  async newPassword(
    dto: NewPasswordInputDto,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<request.Response> {
    return request(this.app.getHttpServer())
      .post('/api/v1/auth/new-password')
      .send(dto)
      .expect(statusCode);
  }
}
