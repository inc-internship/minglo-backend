import { HttpStatus, INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { initTestSettings } from '../helpers/init-test-settings';
import { deleteAllData } from '../helpers/delete-all-data';
import { AuthTestManager } from '../managers/auth-test.manager';
import { EmailService } from '@app/notifications';

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
});
