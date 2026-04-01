import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { initTestSettings } from '../helpers/init-test-settings';
import { deleteAllData } from '../helpers/delete-all-data';
import { AuthTestManager } from '../managers/auth-test.manager';
import { EmailService } from '@app/notifications';
import { PrismaService } from '../../src/database/prisma.service';
import { UsersCleanupJob } from '../../src/modules/user-account/application/jobs';

describe('UsersCleanupJob (e2e)', () => {
  let app: INestApplication<App>;
  let authManager: AuthTestManager;
  let emailService: jest.Mocked<EmailService>;
  let prisma: PrismaService;
  let job: UsersCleanupJob;

  beforeAll(async () => {
    const result = await initTestSettings();
    app = result.app;
    authManager = new AuthTestManager(app);
    emailService = app.get(EmailService);
    prisma = app.get(PrismaService);
    job = app.get(UsersCleanupJob);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
    jest.clearAllMocks();
  });

  it('should delete user with expired confirmation code', async () => {
    const dto = authManager.validDto();
    await authManager.register(dto);

    // протухаем код подтверждения
    await prisma.emailConfirmation.updateMany({
      where: { user: { email: dto.email } },
      data: { expiresAt: new Date('2000-01-01') },
    });

    // as any - отключает проверку TS и вызвать приватный метод класса
    await (job as any).handleCron();

    const user = await prisma.user.findFirst({
      where: { email: dto.email },
    });
    expect(user).toBeNull();
  });

  it('should NOT delete user with valid (non-expired) confirmation code', async () => {
    const dto = authManager.validDto();
    await authManager.register(dto);

    // as any - отключает проверку TS и вызвать приватный метод класса
    await (job as any).handleCron();

    const user = await prisma.user.findFirst({
      where: { email: dto.email },
    });
    expect(user).not.toBeNull();
  });

  it('should NOT delete user with confirmed email', async () => {
    const dto = authManager.validDto();
    await authManager.register(dto);

    const { code } = emailService.sendConfirmationEmail.mock.calls[0][0];
    await authManager.confirmRegistration({ code });

    // протухаем код — но email уже подтверждён, удалять не должен
    await prisma.emailConfirmation.updateMany({
      where: { user: { email: dto.email } },
      data: { expiresAt: new Date('2000-01-01') },
    });

    // as any - отключает проверку TS и вызвать приватный метод класса
    await (job as any).handleCron();

    const user = await prisma.user.findFirst({
      where: { email: dto.email },
    });
    expect(user).not.toBeNull();
  });

  it('should delete only expired users, leaving valid ones intact', async () => {
    const expiredDto = authManager.validDto();
    const validDto = authManager.validDto({ login: 'validUser2', email: 'valid2@gmail.com' });

    await authManager.register(expiredDto);
    await authManager.register(validDto);

    // протухаем только первого
    await prisma.emailConfirmation.updateMany({
      where: { user: { email: expiredDto.email } },
      data: { expiresAt: new Date('2000-01-01') },
    });

    // as any - отключает проверку TS и вызвать приватный метод класса
    await (job as any).handleCron();

    const expiredUser = await prisma.user.findFirst({
      where: { email: expiredDto.email },
    });
    const validUser = await prisma.user.findFirst({
      where: { email: validDto.email },
    });

    expect(expiredUser).toBeNull();
    expect(validUser).not.toBeNull();
  });

  it('should do nothing if there are no expired users', async () => {
    // as any - отключает проверку TS и вызвать приватный метод класса
    await (job as any).handleCron();

    const users = await prisma.user.findMany();
    expect(users).toHaveLength(0);
  });
});
