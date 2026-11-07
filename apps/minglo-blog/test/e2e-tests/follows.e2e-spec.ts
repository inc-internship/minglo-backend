import { HttpStatus, INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { initTestSettings } from '../helpers/init-test-settings';
import { deleteAllData } from '../helpers/delete-all-data';
import { AuthTestManager, FollowsTestManager } from '../managers';
import { RecaptchaService } from '../../src/modules/user-account/application/services/recaptcha.service';

describe('Follows API (e2e)', () => {
  let app: INestApplication<App>;
  let authTestManager: AuthTestManager;
  let followsTestManager: FollowsTestManager;

  beforeAll(async () => {
    const result = await initTestSettings();
    app = result.app;
    authTestManager = result.authTestManager;
    followsTestManager = new FollowsTestManager(app);

    const recaptchaService = app.get(RecaptchaService);
    jest.spyOn(recaptchaService, 'validate').mockResolvedValue(true);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  describe('POST /users/:userId/follow', () => {
    it('401 — should return Unauthorized without token', async () => {
      await followsTestManager.follow('some-user-id', '', HttpStatus.UNAUTHORIZED);
    });

    it('400 — should return BadRequest when trying to follow yourself', async () => {
      const { accessToken } = await authTestManager.setupUser();
      const { body: me } = await authTestManager.me(accessToken);

      await followsTestManager.follow(me.publicId, accessToken, HttpStatus.BAD_REQUEST);
    });

    it('404 — should return NotFound when target user does not exist', async () => {
      const { accessToken } = await authTestManager.setupUser();

      await followsTestManager.follow('non-existent-id', accessToken, HttpStatus.NOT_FOUND);
    });

    it('201 — should follow user successfully', async () => {
      const { accessToken } = await authTestManager.setupUser();
      const { accessToken: otherToken } = await authTestManager.setupUser(
        authTestManager.validDto({ login: 'otherUser1', email: 'other@gmail.com' }),
      );
      const { body: other } = await authTestManager.me(otherToken);

      await followsTestManager.follow(other.publicId, accessToken);
    });

    it('409 — should return Conflict when already following', async () => {
      const { accessToken } = await authTestManager.setupUser();
      const { accessToken: otherToken } = await authTestManager.setupUser(
        authTestManager.validDto({ login: 'otherUser1', email: 'other@gmail.com' }),
      );
      const { body: other } = await authTestManager.me(otherToken);

      await followsTestManager.follow(other.publicId, accessToken);
      await followsTestManager.follow(other.publicId, accessToken, HttpStatus.CONFLICT);
    });
  });

  describe('DELETE /users/:userId/follow', () => {
    it('401 — should return Unauthorized without token', async () => {
      await followsTestManager.unfollow('some-user-id', '', HttpStatus.UNAUTHORIZED);
    });

    it('404 — should return NotFound when not following the user', async () => {
      const { accessToken } = await authTestManager.setupUser();
      const { accessToken: otherToken } = await authTestManager.setupUser(
        authTestManager.validDto({ login: 'otherUser1', email: 'other@gmail.com' }),
      );
      const { body: other } = await authTestManager.me(otherToken);

      await followsTestManager.unfollow(other.publicId, accessToken, HttpStatus.NOT_FOUND);
    });

    it('204 — should unfollow user successfully', async () => {
      const { accessToken } = await authTestManager.setupUser();
      const { accessToken: otherToken } = await authTestManager.setupUser(
        authTestManager.validDto({ login: 'otherUser1', email: 'other@gmail.com' }),
      );
      const { body: other } = await authTestManager.me(otherToken);

      await followsTestManager.follow(other.publicId, accessToken);
      await followsTestManager.unfollow(other.publicId, accessToken);
    });
  });
});
