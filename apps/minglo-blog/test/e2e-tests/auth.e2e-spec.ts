import { HttpStatus, INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { initTestSettings } from '../helpers/init-test-settings';
import { deleteAllData } from '../helpers/delete-all-data';
import { AuthTestManager } from '../managers/auth-test.manager';

describe('Auth API (e2e)', () => {
  let app: INestApplication<App>;
  let authManager: AuthTestManager;

  beforeAll(async () => {
    const result = await initTestSettings();
    app = result.app;
    authManager = new AuthTestManager(app);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  it('204 — should register a new user', async () => {
    await authManager.register(authManager.validDto());
  });

  it('409 — should return conflict if email already exists', async () => {
    await authManager.register(authManager.validDto());

    await authManager.register(authManager.validDto({ login: 'otherUser1' }), HttpStatus.CONFLICT);
  });
});
