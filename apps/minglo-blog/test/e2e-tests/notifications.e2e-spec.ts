import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { initTestSettings } from '../helpers/init-test-settings';
import { deleteAllData } from '../helpers/delete-all-data';
import { AuthTestManager, NotificationsTestManager } from '../managers';
import { NotificationsGateway } from '../../src/modules/notifications/api/notifications.gateway';

describe('Notifications API (e2e)', () => {
  let app: INestApplication<App>;
  let authManager: AuthTestManager;
  let notifManager: NotificationsTestManager;

  beforeAll(async () => {
    const result = await initTestSettings((builder) => {
      builder.overrideProvider(NotificationsGateway).useValue({
        emitNotification: jest.fn(),
        disconnectUser: jest.fn(),
        handleConnection: jest.fn(),
      });
    });
    app = result.app;
    authManager = result.authTestManager;
    notifManager = new NotificationsTestManager(app);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  // GET /notifications
  it('get all: 200 — returns empty page when no notifications', async () => {
    const user = await authManager.setupUser();
    const { body } = await notifManager.getAll(user.accessToken, 200);
    expect(body.items).toHaveLength(0);
    expect(body.hasNextPage).toBe(false);
    expect(body.nextCursor).toBeNull();
    expect(body.totalCount).toBe(0);
  });

  it('get all: 200 — returns notifications with correct shape', async () => {
    const user = await authManager.setupUser();
    const { body: me } = await authManager.me(user.accessToken);
    await notifManager.seed(me.publicId);

    const { body } = await notifManager.getAll(user.accessToken, 200);
    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({
      type: 'SUBSCRIPTION_ACTIVATED',
      message: 'Test notification',
      isRead: false,
    });
    expect(body.items[0].id).toBeDefined();
    expect(body.hasNextPage).toBe(false);
    expect(body.nextCursor).toBeNull();
    expect(body.totalCount).toBe(1);
  });

  it('get all: 200 — cursor pagination returns nextCursor when more items exist', async () => {
    const user = await authManager.setupUser();
    const { body: me } = await authManager.me(user.accessToken);
    for (let i = 0; i < 21; i++) {
      await notifManager.seed(me.publicId);
    }

    const { body: page1 } = await notifManager.getAll(user.accessToken, 200);
    expect(page1.items).toHaveLength(20);
    expect(page1.hasNextPage).toBe(true);
    expect(page1.nextCursor).toBeDefined();
    expect(page1.totalCount).toBe(21);

    const { body: page2 } = await notifManager.getAll(user.accessToken, 200, page1.nextCursor);
    expect(page2.items).toHaveLength(1);
    expect(page2.hasNextPage).toBe(false);
    expect(page2.nextCursor).toBeNull();
    expect(page2.totalCount).toBe(21);
  });

  it('get all: 401 — unauthorized', async () => {
    await notifManager.getAll('invalid-token', 401);
  });

  // PATCH /notifications/read
  it('mark all read: 200 — marks all as read', async () => {
    const user = await authManager.setupUser();
    const { body: me } = await authManager.me(user.accessToken);
    await notifManager.seed(me.publicId);
    await notifManager.seed(me.publicId);

    await notifManager.markAllRead(user.accessToken, 200);

    const { body } = await notifManager.getAll(user.accessToken, 200);
    expect(body.items.every((n: { isRead: boolean }) => n.isRead)).toBe(true);
  });

  it('mark all read: 401 — unauthorized', async () => {
    await notifManager.markAllRead('invalid-token', 401);
  });

  // PATCH /notifications/:id/read
  it('mark one read: 200 — marks single notification as read', async () => {
    const user = await authManager.setupUser();
    const { body: me } = await authManager.me(user.accessToken);
    const notif = await notifManager.seed(me.publicId);

    await notifManager.markOneRead(user.accessToken, notif.id, 200);

    const { body } = await notifManager.getAll(user.accessToken, 200);
    expect(body.items[0].isRead).toBe(true);
  });

  it('mark one read: 404 — notification not found', async () => {
    const user = await authManager.setupUser();
    await notifManager.markOneRead(user.accessToken, 'nonexistent-id', 404);
  });

  it('mark one read: 404 — cannot mark another user notification', async () => {
    const userA = await authManager.setupUser();
    const userB = await authManager.setupUser({
      login: 'validUser2',
      email: 'other@gmail.com',
      password: 'Qwerty123',
      redirectUrl: 'https://minglo.blog/auth/confirm',
    });
    const { body: meA } = await authManager.me(userA.accessToken);
    const notif = await notifManager.seed(meA.publicId);

    await notifManager.markOneRead(userB.accessToken, notif.id, 404);
  });

  it('mark one read: 401 — unauthorized', async () => {
    await notifManager.markOneRead('invalid-token', 'some-id', 401);
  });

  // DELETE /notifications/:id
  it('delete: 200 — deletes notification by id', async () => {
    const user = await authManager.setupUser();
    const { body: me } = await authManager.me(user.accessToken);
    const notif = await notifManager.seed(me.publicId);

    await notifManager.deleteOne(user.accessToken, notif.id, 200);

    const { body } = await notifManager.getAll(user.accessToken, 200);
    expect(body.items).toHaveLength(0);
  });

  it('delete: 404 — notification not found', async () => {
    const user = await authManager.setupUser();
    await notifManager.deleteOne(user.accessToken, 'nonexistent-id', 404);
  });

  it('delete: 404 — cannot delete another user notification', async () => {
    const userA = await authManager.setupUser();
    const userB = await authManager.setupUser({
      login: 'validUser2',
      email: 'other@gmail.com',
      password: 'Qwerty123',
      redirectUrl: 'https://minglo.blog/auth/confirm',
    });
    const { body: meA } = await authManager.me(userA.accessToken);
    const notif = await notifManager.seed(meA.publicId);

    await notifManager.deleteOne(userB.accessToken, notif.id, 404);
  });

  it('delete: 401 — unauthorized', async () => {
    await notifManager.deleteOne('invalid-token', 'some-id', 401);
  });
});
