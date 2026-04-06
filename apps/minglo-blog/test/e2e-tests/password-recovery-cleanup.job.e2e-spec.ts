import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AuthTestManager } from '../managers';
import { EmailService } from '@app/notifications';
import { PrismaService } from '../../src/database/prisma.service';
import { initTestSettings } from '../helpers/init-test-settings';
import { deleteAllData } from '../helpers/delete-all-data';
import { PasswordRecoveryCodeCleanupJob } from '../../src/modules/user-account/application/jobs/password-recovery-code-cleanup-job.service';

describe('JOB password-recovery cleanup (e2e)', () => {
  let app: INestApplication<App>;
  let authManager: AuthTestManager;
  let emailService: jest.Mocked<EmailService>;
  let prisma: PrismaService;
  let job: PasswordRecoveryCodeCleanupJob;

  beforeAll(async () => {
    const result = await initTestSettings();
    app = result.app;
    emailService = app.get(EmailService);
    authManager = new AuthTestManager(app);
    prisma = app.get(PrismaService);
    job = app.get(PasswordRecoveryCodeCleanupJob);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
    jest.clearAllMocks();
  });

  it('should delete password-recovery with expired confirmation code', async () => {
    const dto = authManager.validDto();
    await authManager.register(dto);

    const { code } = emailService.sendConfirmationEmail.mock.calls[0][0];
    await authManager.confirmRegistration({ code });

    await authManager.passwordRecovery({ email: dto.email, redirectUrl: dto.redirectUrl });
    expect(emailService.sendPasswordRecoveryEmail).toHaveBeenCalledTimes(1);

    // протухаем код подтверждения
    await prisma.passwordRecovery.updateMany({
      where: {
        user: {
          email: dto.email,
        },
      },
      data: {
        expiresAt: new Date('2000-01-01'),
      },
    });

    // as any - отключает проверку TS и вызвать приватный метод класса
    await (job as any).handleCron();

    const result = await prisma.passwordRecovery.findFirst({
      where: {
        user: { email: dto.email },
      },
    });
    expect(result).toBeNull();
  });

  it('should NOT delete passwordRecovery with non-expired and NOT usedAt confirmation code', async () => {
    const dto = authManager.validDto();
    await authManager.register(dto);
    const { code } = emailService.sendConfirmationEmail.mock.calls[0][0];
    await authManager.confirmRegistration({ code });
    await authManager.passwordRecovery({ email: dto.email, redirectUrl: dto.redirectUrl });
    expect(emailService.sendPasswordRecoveryEmail).toHaveBeenCalledTimes(1);

    // as any - отключает проверку TS и вызвать приватный метод класса
    await (job as any).handleCron();

    const result = await prisma.passwordRecovery.findFirst({
      where: {
        user: { email: dto.email },
      },
    });
    expect(result).not.toBeNull();
  });

  it('should delete first password-recovery if expired one and not delete second', async () => {
    const dto = authManager.validDto();
    const validDto = authManager.validDto({ login: 'validUser2', email: 'valid2@gmail.com' });

    await authManager.register(dto);
    const { code } = emailService.sendConfirmationEmail.mock.calls[0][0];
    await authManager.confirmRegistration({ code });
    await authManager.passwordRecovery({ email: dto.email, redirectUrl: dto.redirectUrl });

    await authManager.register(validDto);
    const { code: body } = emailService.sendConfirmationEmail.mock.calls[1][0];
    await authManager.confirmRegistration({ code: body });
    await authManager.passwordRecovery({
      email: validDto.email,
      redirectUrl: validDto.redirectUrl,
    });

    // протухаем только первого
    await prisma.passwordRecovery.updateMany({
      where: {
        user: {
          email: dto.email,
        },
      },
      data: {
        expiresAt: new Date('2000-01-01'),
      },
    });

    // as any - отключает проверку TS и вызвать приватный метод класса
    await (job as any).handleCron();

    const expiredUser = await prisma.passwordRecovery.findFirst({
      where: {
        user: { email: dto.email },
      },
    });
    const validUser = await prisma.passwordRecovery.findFirst({
      where: {
        user: { email: validDto.email },
      },
    });

    expect(expiredUser).toBeNull();
    expect(validUser).not.toBeNull();
  });

  it('should delete password-recovery with usedAt confirmation code', async () => {
    const dto = authManager.validDto();
    await authManager.register(dto);

    const { code } = emailService.sendConfirmationEmail.mock.calls[0][0];
    await authManager.confirmRegistration({ code });

    await authManager.passwordRecovery({ email: dto.email, redirectUrl: dto.redirectUrl });
    expect(emailService.sendPasswordRecoveryEmail).toHaveBeenCalledTimes(1);

    // протухаем код подтверждения
    await prisma.passwordRecovery.updateMany({
      where: {
        user: {
          email: dto.email,
        },
      },
      data: {
        usedAt: new Date(),
      },
    });

    // as any - отключает проверку TS и вызвать приватный метод класса
    await (job as any).handleCron();

    const result = await prisma.passwordRecovery.findFirst({
      where: {
        user: { email: dto.email },
      },
    });
    expect(result).toBeNull();
  });

  it('should do nothing if there are no expired password-recovery', async () => {
    // as any - отключает проверку TS и вызвать приватный метод класса
    await (job as any).handleCron();

    const result = await prisma.passwordRecovery.findMany();
    expect(result).toHaveLength(0);
  });
});
