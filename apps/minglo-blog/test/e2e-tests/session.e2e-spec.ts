import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { initTestSettings } from '../helpers/init-test-settings';
import { deleteAllData } from '../helpers/delete-all-data';
import { AuthTestManager } from '../managers/auth-test.manager';
import { EmailService } from '@app/notifications';
import { SessionTestManager } from '../managers/session-test.manager';

describe('Session API (e2e)', () => {
  let app: INestApplication<App>;
  let authManager: AuthTestManager;
  let sessionManager: SessionTestManager;
  let emailService: jest.Mocked<EmailService>;

  beforeAll(async () => {
    const result = await initTestSettings();
    app = result.app;
    authManager = new AuthTestManager(app);
    sessionManager = new SessionTestManager(app);
    emailService = app.get(EmailService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
    jest.clearAllMocks();
  });

  //get devices
  it('get devices: 200 — success', async () => {
    const dto = authManager.validDto();
    await authManager.register(dto);
    const { code } = emailService.sendConfirmationEmail.mock.calls[0][0];
    await authManager.confirmRegistration({ code });
    const { body } = await authManager.login(dto);
    const accessToken = body.accessToken;

    await authManager.login(dto, 200, {
      ip: '127.0.2.2',
      userAgent: 'Firefox/5.0 (Windows NT 11.0; Win64; x64)',
    });
    const { body: devices } = await sessionManager.getSession(accessToken, 200);
    expect(Array.isArray(devices)).toBe(true);
    expect(devices).toHaveLength(2);
  });
});
