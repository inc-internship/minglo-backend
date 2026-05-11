import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { initTestSettings } from '../helpers/init-test-settings';
import { deleteAllData } from '../helpers/delete-all-data';
import { AuthTestManager, ProfileTestManager } from '../managers';
import { EmailService } from '@app/notifications';
import { PrismaService } from '../../src/database/prisma.service';

describe('Session API (e2e)', () => {
  let app: INestApplication<App>;
  let authManager: AuthTestManager;
  let profileTestManager: ProfileTestManager;
  let emailService: jest.Mocked<EmailService>;

  beforeAll(async () => {
    const result = await initTestSettings();
    app = result.app;
    emailService = app.get(EmailService);
    authManager = new AuthTestManager(app);
    profileTestManager = new ProfileTestManager(app);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
    jest.clearAllMocks();
  });

  //get my profile
  it('get profile: 200 — success, full flow: register -> upload avatar -> get profile', async () => {
    const dto = authManager.validDto();
    await authManager.register(dto);
    const { code } = emailService.sendConfirmationEmail.mock.calls[0][0];
    await authManager.confirmRegistration({ code });
    const { body } = await authManager.login(dto);
    const accessToken = body.accessToken;

    const prisma = app.get(PrismaService);
    const userWithProfile = await prisma.user.findUnique({
      where: { email: dto.email },
      include: { profile: true },
    });
    expect(userWithProfile?.profile).not.toBeNull();

    const profileId = userWithProfile!.profile!.id;
    expect(profileId).toBeDefined();

    await prisma.avatar.create({
      data: {
        profileId: profileId,
        mimeType: 'IMAGE_JPEG',

        urlLarge: 'https://s3.amazonaws.com/my-bucket/avatars/large_avatar.jpg',
        keyLarge: 'avatars/large_avatar.jpg',
        fileSizeLarge: 1024500, // ~1MB
        widthLarge: 1080,
        heightLarge: 1080,

        urlSmall: 'https://s3.amazonaws.com/my-bucket/avatars/small_avatar.jpg',
        keySmall: 'avatars/small_avatar.jpg',
        fileSizeSmall: 51200, // ~50KB
        widthSmall: 150,
        heightSmall: 150,
      },
    });

    const { body: profileBody } = await profileTestManager.getMyProfile(accessToken, 200);
    expect(profileBody.login).toBe(dto.login);
    expect(profileBody.avatar.url).toBe(
      'https://s3.amazonaws.com/my-bucket/avatars/large_avatar.jpg',
    );
  });

  //soft delete my profile
  it('delete my profile: 204 — success, full flow: get profile -> softdelete -> login(401) -> getprofile(401)', async () => {
    const dto = authManager.validDto();
    await authManager.register(dto);
    const { code } = emailService.sendConfirmationEmail.mock.calls[0][0];
    await authManager.confirmRegistration({ code });
    const { body } = await authManager.login(dto);
    const accessToken = body.accessToken;

    const prisma = app.get(PrismaService);
    const userWithProfile = await prisma.user.findUnique({
      where: { email: dto.email },
      include: { profile: true },
    });
    expect(userWithProfile?.profile).not.toBeNull();

    const profileId = userWithProfile!.profile!.id;
    expect(profileId).toBeDefined();

    const { body: profileBody } = await profileTestManager.getMyProfile(accessToken, 200);
    expect(profileBody.login).toBe(dto.login);

    await profileTestManager.softDeleteMyProfile(accessToken, 204);

    await authManager.login(dto, 401);

    await profileTestManager.getMyProfile(accessToken, 401);
  });
});
