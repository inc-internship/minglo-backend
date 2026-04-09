import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AuthTestManager, SessionTestManager } from '../managers';
import { PrismaService } from '../../src/database/prisma.service';
import { initTestSettings } from '../helpers/init-test-settings';
import { deleteAllData } from '../helpers/delete-all-data';
import { SessionCleanupJob } from '../../src/modules/user-account/application/jobs';

describe('JOB password-recovery cleanup (e2e)', () => {
  let app: INestApplication<App>;
  let authManager: AuthTestManager;
  let prisma: PrismaService;
  let sessionManager: SessionTestManager;
  let job: SessionCleanupJob;

  beforeAll(async () => {
    const result = await initTestSettings();
    app = result.app;
    authManager = new AuthTestManager(app);
    prisma = app.get(PrismaService);
    sessionManager = new SessionTestManager(app);
    job = app.get(SessionCleanupJob);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
    jest.clearAllMocks();
  });

  it('should do nothing if not found inactive session', async () => {
    const userA = await authManager.setupUser();
    await authManager.login(userA.userDto, 200, {
      ip: '127.0.2.2',
      userAgent: 'Firefox/5.0 (Windows NT 11.0; Win64; x64)',
    });
    await authManager.login(userA.userDto, 200, {
      ip: '127.0.3.5',
      userAgent: 'Firefox/7.0 (Windows NT 11.0; Win64; x64)',
    });

    await (job as any).handleCron();

    const { body: sessionA } = await sessionManager.getSession(userA.accessToken, 200);
    expect(Array.isArray(sessionA)).toBe(true);
    expect(sessionA).toHaveLength(3);
  });

  it('should delete 2 session if session inActive', async () => {
    const userA = await authManager.setupUser();
    await authManager.login(userA.userDto, 200, {
      ip: '127.0.2.2',
      userAgent: 'Firefox/5.0 (Windows NT 11.0; Win64; x64)',
    });
    const { body } = await authManager.login(userA.userDto, 200, {
      ip: '127.0.3.5',
      userAgent: 'Firefox/7.0 (Windows NT 11.0; Win64; x64)',
    });

    const sessions = await prisma.session.findMany({
      where: { user: { email: userA.userDto.email } },
    });

    await prisma.session.updateMany({
      where: {
        id: { in: [sessions[0].id, sessions[1].id] },
      },
      data: { expiresAt: new Date('2000-01-01') },
    });

    // as any - отключает проверку TS и вызвать приватный метод класса
    await (job as any).handleCron();

    const { body: sessionA } = await sessionManager.getSession(body.accessToken, 200);
    expect(sessionA[0].ip).toBe('127.0.3.5');
    expect(Array.isArray(sessionA)).toBe(true);
    expect(sessionA).toHaveLength(1);
  });
});
