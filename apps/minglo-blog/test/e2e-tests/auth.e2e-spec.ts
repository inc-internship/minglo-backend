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

  it('204 — should register a new user', async () => {
    await authManager.register(authManager.validDto());
  });

  it('409 — should return conflict if email already exists', async () => {
    await authManager.register(authManager.validDto());

    await authManager.register(authManager.validDto({ login: 'otherUser1' }), HttpStatus.CONFLICT);
  });

  it('204 — should confirm email after registration', async () => {
    await authManager.register(authManager.validDto());

    const { code } = emailService.sendConfirmationEmail.mock.calls[0][0];

    await authManager.confirmRegistration({ code });
  });

  it('400 — should fail confirmation with wrong code', async () => {
    await authManager.confirmRegistration(
      { code: 'b489bca8-98f3-453f-95cd-1170a018755b' },
      HttpStatus.BAD_REQUEST,
    );
  });

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
});
