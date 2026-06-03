import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { initTestSettings } from '../helpers/init-test-settings';
import { deleteAllData } from '../helpers/delete-all-data';
import { AuthTestManager, ProfileTestManager } from '../managers';
import { EmailService } from '@app/notifications';
import { PrismaService } from '../../src/database/prisma.service';

describe('Profile API (e2e)', () => {
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

    const userPublicId = userWithProfile!.publicId;
    const profileId = userWithProfile!.profile!.id;
    expect(profileId).toBeDefined();

    await prisma.avatar.create({
      data: {
        profileId: profileId,
        mimeType: 'IMAGE_WEBP',

        originalMediaId: 'media-original-id',
        urlOriginal: 'https://s3.amazonaws.com/my-bucket/avatars/original_avatar.webp',
        keyOriginal: 'avatars/original_avatar.webp',
        fileSizeOriginal: 1024500,
        widthOriginal: 800,
        heightOriginal: 800,

        thumbnailMediaId: 'media-thumbnail-id',
        urlThumbnail: 'https://s3.amazonaws.com/my-bucket/avatars/thumbnail_avatar.webp',
        keyThumbnail: 'avatars/thumbnail_avatar.webp',
        fileSizeThumbnail: 51200,
        widthThumbnail: 300,
        heightThumbnail: 300,
      },
    });

    const { body: profileBody } = await profileTestManager.getMyProfile(
      accessToken,
      200,
      userPublicId,
    );
    expect(profileBody.login).toBe(dto.login);
    expect(profileBody.firstName).toBeNull();
    expect(profileBody.lastName).toBeNull();
    expect(profileBody.accountType).toBe('PERSONAL');
    expect(profileBody.avatar.original.url).toBe(
      'https://s3.amazonaws.com/my-bucket/avatars/original_avatar.webp',
    );
    expect(profileBody.avatar.thumbnail.url).toBe(
      'https://s3.amazonaws.com/my-bucket/avatars/thumbnail_avatar.webp',
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
    const userRecord = await prisma.user.findUnique({
      where: { email: dto.email },
    });
    expect(userRecord).not.toBeNull();

    const userPublicId = userRecord!.publicId;

    const { body: profileBody } = await profileTestManager.getMyProfile(
      accessToken,
      200,
      userPublicId,
    );
    expect(profileBody.login).toBe(dto.login);

    await profileTestManager.deleteMe(accessToken, 204);

    await authManager.login(dto, 401);

    await profileTestManager.getMyProfile(accessToken, 401, userPublicId);
  });
});
