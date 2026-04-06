import { HttpStatus, INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { initTestSettings } from '../helpers/init-test-settings';
import { deleteAllData } from '../helpers/delete-all-data';
import { AuthTestManager } from '../managers';
import { EmailService } from '@app/notifications';
import request from 'supertest';
import { PrismaService } from '../../src/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';

describe('Auth API (e2e)', () => {
  let app: INestApplication<App>;
  let authTestManager: AuthTestManager;
  let emailService: jest.Mocked<EmailService>;

  beforeAll(async () => {
    const result = await initTestSettings();
    app = result.app;
    authTestManager = result.authTestManager;
    emailService = app.get(EmailService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
    jest.clearAllMocks();
  });

  // Регистрация
  it('Registration: 204 — should register a new user', async () => {
    await authTestManager.register(authTestManager.validDto());
  });
  it('Registration: 409 — should return conflict if email already exists', async () => {
    await authTestManager.register(authTestManager.validDto());

    await authTestManager.register(
      authTestManager.validDto({ login: 'otherUser1' }),
      HttpStatus.CONFLICT,
    );
  });

  // Подтверждение по почте
  it('Confirm email: 204 — should confirm email after registration', async () => {
    await authTestManager.register(authTestManager.validDto());

    const { code } = emailService.sendConfirmationEmail.mock.calls[0][0];

    await authTestManager.confirmRegistration({ code });
  });
  it('Confirm email: 400 — should fail confirmation with wrong code', async () => {
    await authTestManager.confirmRegistration(
      { code: 'b489bca8-98f3-453f-95cd-1170a018755b' },
      HttpStatus.BAD_REQUEST,
    );
  });

  // повторное подтверждение по почте
  it('204 — should resend confirmation email and allow confirm with new code', async () => {
    const dto = authTestManager.validDto();
    await authTestManager.register(dto);

    await authTestManager.resendConfirmationEmail({
      email: dto.email,
      redirectUrl: dto.redirectUrl,
    });

    const { code } = emailService.sendConfirmationEmail.mock.calls[1][0];

    await authTestManager.confirmRegistration({ code });
  });
  it('400 — should fail resend if email is already confirmed', async () => {
    const dto = authTestManager.validDto();
    await authTestManager.register(dto);

    const { code } = emailService.sendConfirmationEmail.mock.calls[0][0];
    await authTestManager.confirmRegistration({ code });

    await authTestManager.resendConfirmationEmail(
      { email: dto.email, redirectUrl: dto.redirectUrl },
      HttpStatus.BAD_REQUEST,
    );
  });
  it('400 — should fail resend for non-existent email', async () => {
    await authTestManager.resendConfirmationEmail(
      { email: 'nonexistent@gmail.com', redirectUrl: 'https://minglo.blog/auth/confirm' },
      HttpStatus.BAD_REQUEST,
    );
  });

  // Логин
  it('Login: 200 — success (returns token and cookie)', async () => {
    const dto = authTestManager.validDto();
    await authTestManager.register(dto);

    const { code } = emailService.sendConfirmationEmail.mock.calls[0][0];
    await authTestManager.confirmRegistration({ code });

    const { body, headers } = await authTestManager.login(dto);

    expect(body.accessToken).toBeDefined();
    expect(headers['set-cookie']).toBeDefined();
  });
  it('Login: 401 — wrong credentials', async () => {
    const registrationDto = authTestManager.validDto();
    await authTestManager.register(registrationDto);

    const { code } = emailService.sendConfirmationEmail.mock.calls[0][0];
    await authTestManager.confirmRegistration({ code });

    await authTestManager.login(
      { email: 'valid@gmail.com', password: 'Qwerty12365' },
      HttpStatus.UNAUTHORIZED,
    );
  });
  it('Login: 401 — user not found', async () => {
    await authTestManager.login(
      { email: 'non-existent-user@mail.com', password: 'SomePassword123!' },
      HttpStatus.UNAUTHORIZED,
    );
  });
  it('Login: 401 — should fail if User-Agent header is missing', async () => {
    const dto = authTestManager.validDto();

    const { body, status } = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .set('x-forwarded-for', '127.0.0.1')
      .send(dto);

    expect(status).toBe(401);
    expect(body.message).toBe('User-Agent header is required');
  });

  //me
  it('Me: 200 — should return current user profile with valid token', async () => {
    const registerDto = authTestManager.validDto();
    await authTestManager.register(registerDto);

    const { code } = emailService.sendConfirmationEmail.mock.calls[0][0];
    await authTestManager.confirmRegistration({ code });

    const { body, headers } = await authTestManager.login(registerDto);

    expect(body.accessToken).toBeDefined();
    expect(headers['set-cookie']).toBeDefined();

    const accessToken = body.accessToken;

    const response = await authTestManager.me(accessToken);

    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toEqual({
      publicId: expect.any(String),
      login: registerDto.login,
      email: registerDto.email,
    });

    expect(response.body.password).toBeUndefined();
    expect(response.body.confirmationCode).toBeUndefined();
  });
  it('Me: 401 — should return Unauthorized if token is missing or invalid', async () => {
    await authTestManager.me('', HttpStatus.UNAUTHORIZED);

    const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.payload';
    await authTestManager.me(fakeToken, HttpStatus.UNAUTHORIZED);
  });

  // rotation tokens(refresh-tokens)
  it('Refresh Token: 200 — success rotation (updates access token and cookie)', async () => {
    const dto = authTestManager.validDto();
    await authTestManager.register(dto);
    const { code } = emailService.sendConfirmationEmail.mock.calls[0][0];
    await authTestManager.confirmRegistration({ code });

    const loginRes = await authTestManager.login(dto);
    const firstAccessToken = loginRes.body.accessToken;
    const firstCookie = loginRes.headers['set-cookie'];

    await new Promise((res) => setTimeout(res, 1000));

    const refreshRes = await authTestManager.refreshToken(firstCookie);

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.accessToken).toBeDefined();
    expect(refreshRes.body.accessToken).not.toBe(firstAccessToken);

    const secondCookie = refreshRes.headers['set-cookie'];
    expect(secondCookie).toBeDefined();
    expect(secondCookie).not.toBe(firstCookie);
  });
  it('Refresh Token: 403 — Forbidden (token reuse detection)', async () => {
    const dto = authTestManager.validDto();
    await authTestManager.register(dto);
    const { code } = emailService.sendConfirmationEmail.mock.calls[0][0];
    await authTestManager.confirmRegistration({ code });

    const loginRes = await authTestManager.login(dto);
    const firstCookie = loginRes.headers['set-cookie'];

    await new Promise((res) => setTimeout(res, 1000));

    await authTestManager.refreshToken(firstCookie);
    await new Promise((res) => setTimeout(res, 1000));

    const reuseRes = await authTestManager.refreshToken(firstCookie, 403);

    expect(reuseRes.status).toBe(403);
    expect(reuseRes.body.message).toContain('Token reuse detected');
  });
  it('Refresh Token: 401 — Unauthorized (session cleared after reuse attempt)', async () => {
    const dto = authTestManager.validDto();
    await authTestManager.register(dto);
    const { code } = emailService.sendConfirmationEmail.mock.calls[0][0];
    await authTestManager.confirmRegistration({ code });

    const loginRes = await authTestManager.login(dto);
    const cookie1 = loginRes.headers['set-cookie'];

    await new Promise((res) => setTimeout(res, 1000));
    const refreshRes = await authTestManager.refreshToken(cookie1);
    const cookie2 = refreshRes.headers['set-cookie'];

    await new Promise((res) => setTimeout(res, 1000));

    await authTestManager.refreshToken(cookie1, 403);

    const finalRes = await authTestManager.refreshToken(cookie2, 401);

    expect(finalRes.status).toBe(401);
    expect(finalRes.body.message).toContain('Session not found');
  });

  //logout
  it('Logout: 204 — success (clears cookie and marks session as deleted)', async () => {
    const dto = authTestManager.validDto();
    await authTestManager.register(dto);
    const { code } = emailService.sendConfirmationEmail.mock.calls[0][0];
    await authTestManager.confirmRegistration({ code });

    const { body, headers } = await authTestManager.login(dto);
    const accessToken = body.accessToken;
    const refreshTokenCookie = headers['set-cookie'];

    const logoutResponse = await authTestManager.logout(accessToken, refreshTokenCookie);
    expect(logoutResponse.status).toBe(204);

    const setCookie = logoutResponse.headers['set-cookie'];
    expect(setCookie[0]).toMatch(/refreshToken=;/);
    expect(setCookie[0]).toMatch(/Max-Age=0|Expires=Thu, 01 Jan 1970/);

    const jwtService = app.get(JwtService);
    const payload = jwtService.decode(body.accessToken);
    const prisma = app.get(PrismaService);
    const session = await prisma.session.findUnique({
      where: {
        userId: payload.userId,
        deviceId: payload.deviceId,
      },
    });
    expect(session).not.toBeNull();
    expect(session!.deletedAt).toBeInstanceOf(Date);
  });
  it('Logout: 401 — fail (unauthorized)', async () => {
    const response = await authTestManager.logout('', [], 401);

    expect(response.status).toBe(401);
  });

  //password-recovery
  it('password-recovery — success', async () => {
    const dto = authTestManager.validDto();
    await authTestManager.register(dto);

    const { code } = emailService.sendConfirmationEmail.mock.calls[0][0];
    await authTestManager.confirmRegistration({ code });

    const { body, headers } = await authTestManager.login(dto);

    expect(body.accessToken).toBeDefined();
    expect(headers['set-cookie']).toBeDefined();

    await authTestManager.passwordRecovery({ email: dto.email, redirectUrl: dto.redirectUrl });

    expect(emailService.sendPasswordRecoveryEmail).toHaveBeenCalledTimes(1);

    const recoveryEmailArgs = emailService.sendPasswordRecoveryEmail.mock.calls[0][0];

    expect(recoveryEmailArgs.email).toBe(dto.email);
    expect(recoveryEmailArgs.redirectUrl).toBe(dto.redirectUrl);
    expect(recoveryEmailArgs.code).toBeDefined();
  });
  it('password-recovery: user does NOT exist — success 404 (security check)', async () => {
    const fakeDto = {
      email: 'non-existent-user@ghost.com',
      redirectUrl: 'https://minglo.blog/recovery',
    };

    const response = await authTestManager.passwordRecovery(fakeDto, 404);

    expect(response.status).toBe(404);
    expect(emailService.sendPasswordRecoveryEmail).not.toHaveBeenCalled();
  });

  //new-password
  it('new-password — success', async () => {
    const dto = authTestManager.validDto();
    await authTestManager.register(dto);
    const { code } = emailService.sendConfirmationEmail.mock.calls[0][0];
    await authTestManager.confirmRegistration({ code });
    await authTestManager.login(dto);
    await authTestManager.passwordRecovery({ email: dto.email, redirectUrl: dto.redirectUrl });
    const recoveryEmailArgs = emailService.sendPasswordRecoveryEmail.mock.calls[0][0];
    const recoveryCode = recoveryEmailArgs.code;

    await authTestManager.newPassword({ newPassword: 'QweRty123', recoveryCode: recoveryCode });
    const prisma = app.get(PrismaService);
    const updatedRecovery = await prisma.passwordRecovery.findUnique({
      where: { recoveryCode: recoveryCode },
    });
    expect(updatedRecovery?.usedAt).toBeInstanceOf(Date);
  });
  it('new-password — invalid code', async () => {
    const dto = authTestManager.validDto();
    await authTestManager.register(dto);
    const { code } = emailService.sendConfirmationEmail.mock.calls[0][0];
    await authTestManager.confirmRegistration({ code });
    await authTestManager.login(dto);
    await authTestManager.passwordRecovery({ email: dto.email, redirectUrl: dto.redirectUrl });

    await authTestManager.newPassword(
      { newPassword: 'QweRty123', recoveryCode: randomUUID() },
      400,
    );
  });
});
