import { HttpStatus, INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { initTestSettings } from '../helpers/init-test-settings';
import { deleteAllData } from '../helpers/delete-all-data';
import { AuthTestManager } from '../managers';
import { EmailService } from '@app/notifications';
import request from 'supertest';

describe('Users API (e2e)', () => {
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

  // GET /api/v1/users/total-count — total registered users count
  it('GET /users/total-count: 200 — returns totalCount=0 when no users registered', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/users/total-count')
      .expect(HttpStatus.OK);

    expect(response.body).toEqual({ totalCount: 0 });
  });

  it('GET /users/total-count: 200 — does not count unconfirmed users', async () => {
    await authTestManager.register(authTestManager.validDto());

    const response = await request(app.getHttpServer())
      .get('/api/v1/users/total-count')
      .expect(HttpStatus.OK);

    expect(response.body).toEqual({ totalCount: 0 });
  });

  it('GET /users/total-count: 200 — counts only confirmed users', async () => {
    const dto = authTestManager.validDto();
    await authTestManager.register(dto);

    const { code } = emailService.sendConfirmationEmail.mock.calls[0][0];
    await authTestManager.confirmRegistration({ code });

    const response = await request(app.getHttpServer())
      .get('/api/v1/users/total-count')
      .expect(HttpStatus.OK);

    expect(response.body).toEqual({ totalCount: 1 });
  });

  it('GET /users/total-count: 200 — counts multiple confirmed users correctly', async () => {
    const dto1 = authTestManager.validDto();
    const dto2 = authTestManager.validDto({ login: 'validUser2', email: 'valid2@gmail.com' });

    await authTestManager.register(dto1);
    const { code: code1 } = emailService.sendConfirmationEmail.mock.calls[0][0];
    await authTestManager.confirmRegistration({ code: code1 });

    await authTestManager.register(dto2);
    const { code: code2 } = emailService.sendConfirmationEmail.mock.calls[1][0];
    await authTestManager.confirmRegistration({ code: code2 });

    const response = await request(app.getHttpServer())
      .get('/api/v1/users/total-count')
      .expect(HttpStatus.OK);

    expect(response.body).toEqual({ totalCount: 2 });
  });

  it('GET /users/total-count: 200 — unconfirmed user is not counted alongside confirmed ones', async () => {
    const dto1 = authTestManager.validDto();
    const dto2 = authTestManager.validDto({ login: 'validUser2', email: 'valid2@gmail.com' });

    await authTestManager.register(dto1);
    const { code } = emailService.sendConfirmationEmail.mock.calls[0][0];
    await authTestManager.confirmRegistration({ code });

    // dto2 registered but not confirmed
    await authTestManager.register(dto2);

    const response = await request(app.getHttpServer())
      .get('/api/v1/users/total-count')
      .expect(HttpStatus.OK);

    expect(response.body).toEqual({ totalCount: 1 });
  });
});
