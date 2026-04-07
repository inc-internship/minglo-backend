import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { initTestSettings } from '../helpers/init-test-settings';
import { deleteAllData } from '../helpers/delete-all-data';
import { AuthTestManager, SessionTestManager } from '../managers';
import { EmailService } from '@app/notifications';

describe('Session API (e2e)', () => {
  let app: INestApplication<App>;
  let authManager: AuthTestManager;
  let sessionManager: SessionTestManager;
  let emailService: jest.Mocked<EmailService>;

  beforeAll(async () => {
    const result = await initTestSettings();
    app = result.app;
    emailService = app.get(EmailService);
    authManager = new AuthTestManager(app);
    sessionManager = new SessionTestManager(app);
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

  // delete session
  it('delete session 204', async () => {
    const userA = await authManager.setupUser();
    await authManager.login(userA.userDto, 200, {
      ip: '127.0.2.2',
      userAgent: 'Firefox/5.0 (Windows NT 11.0; Win64; x64)',
    });
    const { body: sessionA } = await sessionManager.getSession(userA.accessToken, 200);
    const deviceIdB = sessionA[1].deviceId;
    expect(Array.isArray(sessionA)).toBe(true);
    expect(sessionA).toHaveLength(2);
    await sessionManager.deleteSession(userA.accessToken, deviceIdB, 204);
    const { body: session } = await sessionManager.getSession(userA.accessToken, 200);
    expect(Array.isArray(session)).toBe(true);
    expect(session).toHaveLength(1);
    expect(session[0].deviceId).not.toBe(deviceIdB);
  });
  it('session not found: 404', async () => {
    const userA = await authManager.setupUser();
    await sessionManager.deleteSession(
      userA.accessToken,
      '9d775100-70bc-4910-9c3b-f4ec30cab80e',
      404,
    );
  });
  it('delete session: 403', async () => {
    const userA = await authManager.setupUser();
    const { body: sessionsA } = await sessionManager.getSession(userA.accessToken, 200);
    const deviceIdA = sessionsA[0].deviceId;
    const userB = await authManager.setupUser({
      login: 'validUser2',
      email: 'valiD@gmail.com',
      password: 'Qwerty123',
      redirectUrl: 'https://minglo.blog/auth/confirm',
    });
    await sessionManager.deleteSession(userB.accessToken, deviceIdA, 403);
  });

  //Delete all other sessions for users
  it('delete all other sessions for users 204', async () => {
    const userA = await authManager.setupUser();
    await authManager.login(userA.userDto, 200, {
      ip: '127.0.2.2',
      userAgent: 'Firefox/5.0 (Windows NT 11.0; Win64; x64)',
    });
    await authManager.login(userA.userDto, 200, {
      ip: '127.0.3.5',
      userAgent: 'Firefox/7.0 (Windows NT 11.0; Win64; x64)',
    });
    const { body: sessionA } = await sessionManager.getSession(userA.accessToken, 200);
    expect(Array.isArray(sessionA)).toBe(true);
    expect(sessionA).toHaveLength(3);
    await sessionManager.deleteAllOtherSession(userA.accessToken, 204);
    const { body: session } = await sessionManager.getSession(userA.accessToken, 200);
    expect(Array.isArray(session)).toBe(true);
    expect(session).toHaveLength(1);
  });
});
