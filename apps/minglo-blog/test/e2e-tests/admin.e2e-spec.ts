import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { of } from 'rxjs';
import { initTestSettings } from '../helpers/init-test-settings';
import { deleteAllData } from '../helpers/delete-all-data';
import { AuthTestManager, FollowsTestManager } from '../managers';
import { AdminTestManager } from '../managers/admin-test.manager';
import { AdminConfig } from '../../src/modules/admin/admin.config';
import { CoreConfig } from '../../src/core/core.config';
import { RecaptchaService } from '../../src/modules/user-account/application/services/recaptcha.service';
import { PAYMENT_SERVICE, PaymentStatus, PaymentSystem } from '@app/payments';
import { PaymentHistoryViewDto } from '@app/payments/view-dto';

const PAYMENT_HISTORY_STUB: PaymentHistoryViewDto = {
  items: [
    {
      id: 'pay-1',
      paymentDate: '2025-01-01T00:00:00.000Z',
      subscriptionExpiresAt: '2025-02-01T00:00:00.000Z',
      amount: '10.00',
      planName: '1 Month',
      paymentSystem: PaymentSystem.STRIPE,
      status: PaymentStatus.SUCCESS,
      failureReason: null,
    },
  ],
  totalCount: 1,
  page: 1,
  pageSize: 8,
  pagesCount: 1,
};

const paymentClientMock = {
  send: jest.fn(),
  emit: jest.fn(),
};

describe('Admin GraphQL API (e2e)', () => {
  let app: INestApplication<App>;
  let authTestManager: AuthTestManager;
  let followsTestManager: FollowsTestManager;
  let adminTestManager: AdminTestManager;

  beforeAll(async () => {
    const result = await initTestSettings((builder) => {
      builder.overrideProvider(PAYMENT_SERVICE).useValue(paymentClientMock);
    });

    app = result.app;
    authTestManager = result.authTestManager;
    followsTestManager = new FollowsTestManager(app);

    const adminConfig = app.get(AdminConfig);
    const coreConfig = app.get(CoreConfig);

    adminTestManager = new AdminTestManager(
      app,
      adminConfig.email,
      adminConfig.password,
      coreConfig.graphqlPath,
    );

    jest.spyOn(app.get(RecaptchaService), 'validate').mockResolvedValue(true);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
    jest.clearAllMocks();
    paymentClientMock.send.mockReturnValue(of(PAYMENT_HISTORY_STUB));
  });

  async function createUser(overrides: Parameters<AuthTestManager['validDto']>[0] = {}) {
    const { accessToken } = await authTestManager.setupUser(authTestManager.validDto(overrides));
    const { body } = await authTestManager.me(accessToken);
    return body;
  }

  describe('auth', () => {
    it('401 — should reject request without Basic auth', async () => {
      const { body } = await adminTestManager.users({}, { auth: false });

      expect(body.errors).toBeDefined();
      expect(body.errors[0].message).toMatch(/Basic auth required/i);
    });

    it('401 — should reject invalid credentials', async () => {
      const { body } = await adminTestManager.users({}, { wrongAuth: true });

      expect(body.errors).toBeDefined();
      expect(body.errors[0].message).toMatch(/Invalid credentials/i);
    });
  });

  describe('users query', () => {
    it('should return registered users', async () => {
      const user = await createUser();

      const { body } = await adminTestManager.users();

      expect(body.errors).toBeUndefined();
      expect(body.data.users.totalCount).toBe(1);
      expect(body.data.users.items[0]).toMatchObject({
        id: user.publicId,
        username: user.login,
        profileLink: `/profile/${user.publicId}`,
        isBlocked: false,
      });
    });

    it('should filter users by search', async () => {
      await createUser({ login: 'alphaUser1' });
      await createUser({ login: 'betaUser1', email: 'beta@gmail.com' });

      const { body } = await adminTestManager.users({ search: 'alpha' });

      expect(body.data.users.totalCount).toBe(1);
      expect(body.data.users.items[0].username).toBe('alphaUser1');
    });

    it('should sort users by username asc', async () => {
      await createUser({ login: 'zuluUser1' });
      await createUser({ login: 'alphaUser1', email: 'alpha@gmail.com' });

      const { body } = await adminTestManager.users({ sortBy: 'USERNAME_ASC' });

      expect(body.data.users.items.map((u: { username: string }) => u.username)).toEqual([
        'alphaUser1',
        'zuluUser1',
      ]);
    });

    it('should paginate users', async () => {
      await createUser({ login: 'userA1' });
      await createUser({ login: 'userB1', email: 'b@gmail.com' });
      await createUser({ login: 'userC1', email: 'c@gmail.com' });

      const { body } = await adminTestManager.users({ page: 1, pageSize: 2 });

      expect(body.data.users.items).toHaveLength(2);
      expect(body.data.users.totalCount).toBe(3);
      expect(body.data.users.pagesCount).toBe(2);
    });
  });

  describe('user query', () => {
    it('should return user detail', async () => {
      const user = await createUser();

      const { body } = await adminTestManager.user(user.publicId);

      expect(body.errors).toBeUndefined();
      expect(body.data.user).toMatchObject({
        id: user.publicId,
        username: user.login,
        isBlocked: false,
        followersCount: 0,
        followingCount: 0,
      });
    });

    it('should return not found for missing user', async () => {
      const { body } = await adminTestManager.user('non-existent-public-id');

      expect(body.errors).toBeDefined();
      expect(body.errors[0].message).toBe('User not found');
    });
  });

  describe('blockUser / unblockUser', () => {
    it('should block and unblock user', async () => {
      const user = await createUser();

      const blockRes = await adminTestManager.blockUser(user.publicId);
      expect(blockRes.body.data.blockUser).toBe(true);

      const blockedDetail = await adminTestManager.user(user.publicId);
      expect(blockedDetail.body.data.user.isBlocked).toBe(true);

      const unblockRes = await adminTestManager.unblockUser(user.publicId);
      expect(unblockRes.body.data.unblockUser).toBe(true);

      const unblockedDetail = await adminTestManager.user(user.publicId);
      expect(unblockedDetail.body.data.user.isBlocked).toBe(false);
    });

    it('should return not found when blocking missing user', async () => {
      const { body } = await adminTestManager.blockUser('non-existent-public-id');

      expect(body.errors).toBeDefined();
      expect(body.errors[0].message).toBe('User not found');
    });
  });

  describe('deleteUser', () => {
    it('should hard-delete user', async () => {
      const user = await createUser();

      const deleteRes = await adminTestManager.deleteUser(user.publicId);
      expect(deleteRes.body.data.deleteUser).toBe(true);

      const listRes = await adminTestManager.users();
      expect(listRes.body.data.users.totalCount).toBe(0);

      const detailRes = await adminTestManager.user(user.publicId);
      expect(detailRes.body.errors[0].message).toBe('User not found');
    });
  });

  describe('userFollowers / userFollowing', () => {
    it('should return followers and following lists', async () => {
      const { accessToken } = await authTestManager.setupUser();
      const { body: me } = await authTestManager.me(accessToken);

      const { accessToken: otherToken } = await authTestManager.setupUser(
        authTestManager.validDto({ login: 'otherUser1', email: 'other@gmail.com' }),
      );
      const { body: other } = await authTestManager.me(otherToken);

      await followsTestManager.follow(other.publicId, accessToken);

      const followersRes = await adminTestManager.userFollowers(other.publicId);
      expect(followersRes.body.data.userFollowers.totalCount).toBe(1);
      expect(followersRes.body.data.userFollowers.items[0].userId).toBe(me.publicId);

      const followingRes = await adminTestManager.userFollowing(me.publicId);
      expect(followingRes.body.data.userFollowing.totalCount).toBe(1);
      expect(followingRes.body.data.userFollowing.items[0].userId).toBe(other.publicId);
    });
  });

  describe('userPayments', () => {
    it('should return payment history from payment service', async () => {
      const user = await createUser();

      const { body } = await adminTestManager.userPayments(user.publicId);

      expect(body.errors).toBeUndefined();
      expect(body.data.userPayments.totalCount).toBe(1);
      expect(body.data.userPayments.items[0]).toMatchObject({
        id: 'pay-1',
        planName: '1 Month',
        status: 'SUCCESS',
      });
      expect(paymentClientMock.send).toHaveBeenCalled();
    });
  });
});
