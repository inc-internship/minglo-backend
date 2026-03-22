import { HttpStatus, INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { initTestSettings } from '../helpers/init-test-settings';
import { deleteAllData } from '../helpers/delete-all-data';
import { AuthTestManager } from '../managers/auth-test.manager';
import { EmailService } from '@app/notifications';
import request from 'supertest';

describe('Auth API (e2e)', () => {
  let app: INestApplication<App>;
  let authManager: AuthTestManager;
  let emailService: jest.Mocked<EmailService>;

  beforeAll(async () => {
    const result = await initTestSettings();
    app = result.app;
    authManager = new AuthTestManager(app);
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
    await authManager.register(authManager.validDto());
  });
  it('Registration: 409 — should return conflict if email already exists', async () => {
    await authManager.register(authManager.validDto());

    await authManager.register(authManager.validDto({ login: 'otherUser1' }), HttpStatus.CONFLICT);
  });

  // Подтверждение по почте
  it('Confirm email: 204 — should confirm email after registration', async () => {
    await authManager.register(authManager.validDto());

    const { code } = emailService.sendConfirmationEmail.mock.calls[0][0];

    await authManager.confirmRegistration({ code });
  });
  it('Confirm email: 400 — should fail confirmation with wrong code', async () => {
    await authManager.confirmRegistration(
      { code: 'b489bca8-98f3-453f-95cd-1170a018755b' },
      HttpStatus.BAD_REQUEST,
    );
  });

  // повторное подтверждение по почте
  it('204 — should resend confirmation email and allow confirm with new code', async () => {
    const dto = authManager.validDto();
    await authManager.register(dto);

    await authManager.resendConfirmationEmail({ email: dto.email, redirectUrl: dto.redirectUrl });

    const { code } = emailService.sendConfirmationEmail.mock.calls[1][0];

    await authManager.confirmRegistration({ code });
  });
  it('400 — should fail resend if email is already confirmed', async () => {
    const dto = authManager.validDto();
    await authManager.register(dto);

    const { code } = emailService.sendConfirmationEmail.mock.calls[0][0];
    await authManager.confirmRegistration({ code });

    await authManager.resendConfirmationEmail(
      { email: dto.email, redirectUrl: dto.redirectUrl },
      HttpStatus.BAD_REQUEST,
    );
  });
  it('400 — should fail resend for non-existent email', async () => {
    await authManager.resendConfirmationEmail(
      { email: 'nonexistent@gmail.com', redirectUrl: 'https://minglo.blog/auth/confirm' },
      HttpStatus.BAD_REQUEST,
    );
  });

  // Логин
  it('Login: 200 — success (returns token and cookie)', async () => {
    const dto = authManager.validDto();
    await authManager.register(dto);

    const { code } = emailService.sendConfirmationEmail.mock.calls[0][0];
    await authManager.confirmRegistration({ code });

    const { body, headers } = await authManager.login(dto);

    expect(body.accessToken).toBeDefined();
    expect(headers['set-cookie']).toBeDefined();
  });
  it('Login: 401 — wrong credentials', async () => {
    const registrationDto = authManager.validDto();
    await authManager.register(registrationDto);

    const { code } = emailService.sendConfirmationEmail.mock.calls[0][0];
    await authManager.confirmRegistration({ code });

    await authManager.login(
      { email: 'valid@gmail.com', password: 'Qwerty12365' },
      HttpStatus.UNAUTHORIZED,
    );
  });
  it('Login: 400 — user not found (security-focused response)', async () => {
    await authManager.login(
      { email: 'non-existent-user@mail.com', password: 'SomePassword123!' },
      HttpStatus.BAD_REQUEST,
    );
  });
  it('Login: 401 — should fail if User-Agent header is missing', async () => {
    const dto = authManager.validDto();

    const { body, status } = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .set('x-forwarded-for', '127.0.0.1')
      .send(dto);

    expect(status).toBe(401);
    expect(body.message).toBe('User-Agent header is required');
  });

  //me
  it('Me: 200 — should return current user profile with valid token', async () => {
    const registerDto = authManager.validDto();
    await authManager.register(registerDto);

    const { code } = emailService.sendConfirmationEmail.mock.calls[0][0];
    await authManager.confirmRegistration({ code });

    const { body, headers } = await authManager.login(registerDto);

    expect(body.accessToken).toBeDefined();
    expect(headers['set-cookie']).toBeDefined();

    const accessToken = body.accessToken;

    const response = await authManager.me(accessToken);

    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toEqual({
      id: expect.any(String),
      login: registerDto.login,
      email: registerDto.email,
    });

    expect(response.body.password).toBeUndefined();
    expect(response.body.confirmationCode).toBeUndefined();
  });
  it('Me: 401 — should return Unauthorized if token is missing or invalid', async () => {
    await authManager.me('', HttpStatus.UNAUTHORIZED);

    const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.payload';
    await authManager.me(fakeToken, HttpStatus.UNAUTHORIZED);
  });
});
