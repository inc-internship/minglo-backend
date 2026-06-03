import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { initTestSettings } from '../helpers/init-test-settings';
import { deleteAllData } from '../helpers/delete-all-data';
import { AuthTestManager } from '../managers';
import { PrismaService } from '../../src/database/prisma.service';
import { PostsCleanupJob } from '../../src/modules/posts/application/jobs';

describe('JOB posts cleanup (e2e)', () => {
  let app: INestApplication<App>;
  let authManager: AuthTestManager;
  let prisma: PrismaService;
  let job: PostsCleanupJob;

  beforeAll(async () => {
    const result = await initTestSettings();
    app = result.app;
    authManager = new AuthTestManager(app);
    prisma = app.get(PrismaService);
    job = app.get(PostsCleanupJob);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
    jest.clearAllMocks();
  });

  async function createPost(userId: number, deletedAt?: Date) {
    return prisma.post.create({
      data: {
        userId,
        description: null,
        deletedAt: deletedAt ?? null,
      },
    });
  }

  async function setupUserInDb() {
    await authManager.setupUser();
    return prisma.user.findFirstOrThrow();
  }

  it('should do nothing if there are no soft-deleted posts', async () => {
    const user = await setupUserInDb();
    await createPost(user.id);

    await (job as any).handleCron();

    const posts = await prisma.post.findMany();
    expect(posts).toHaveLength(1);
  });

  it('should permanently delete soft-deleted post', async () => {
    const user = await setupUserInDb();
    await createPost(user.id, new Date());

    await (job as any).handleCron();

    const posts = await prisma.post.findMany();
    expect(posts).toHaveLength(0);
  });

  it('should delete only soft-deleted posts, leaving active ones intact', async () => {
    const user = await setupUserInDb();
    await createPost(user.id);
    await createPost(user.id, new Date());

    await (job as any).handleCron();

    const posts = await prisma.post.findMany();
    expect(posts).toHaveLength(1);
    expect(posts[0].deletedAt).toBeNull();
  });

  it('should permanently delete multiple soft-deleted posts at once', async () => {
    const user = await setupUserInDb();
    await createPost(user.id, new Date());
    await createPost(user.id, new Date());
    await createPost(user.id);

    await (job as any).handleCron();

    const posts = await prisma.post.findMany();
    expect(posts).toHaveLength(1);
  });

  it('should do nothing if there are no posts at all', async () => {
    await (job as any).handleCron();

    const posts = await prisma.post.findMany();
    expect(posts).toHaveLength(0);
  });
});
