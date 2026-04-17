import { HttpStatus, INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { of } from 'rxjs';
import { initTestSettings } from '../helpers/init-test-settings';
import { deleteAllData } from '../helpers/delete-all-data';
import { AuthTestManager, PostsTestManager } from '../managers';
import { MEDIA_SERVICE } from '@app/media/constants';
import { MediaMimeType } from '@app/media/enums';
import { MediaFileMetaDataViewDto } from '@app/media/api/view-dto';
import { RecaptchaService } from '../../src/modules/user-account/application/services/recaptcha.service';

const mockMediaFile: MediaFileMetaDataViewDto = {
  publicId: 'pub-media-1',
  url: 'https://s3.example.com/image.webp',
  key: 'posts/user/image.webp',
  mimeType: MediaMimeType.IMAGE_WEBP,
  width: 800,
  height: 600,
  fileSize: 12345,
  usedAt: null,
};

describe('Posts API (e2e)', () => {
  let app: INestApplication<App>;
  let authTestManager: AuthTestManager;
  let postsTestManager: PostsTestManager;
  let mediaClientMock: { send: jest.Mock; connect: jest.Mock; close: jest.Mock };

  beforeAll(async () => {
    mediaClientMock = {
      send: jest.fn().mockReturnValue(of([mockMediaFile])),
      connect: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
    };

    const result = await initTestSettings((builder) => {
      builder.overrideProvider(MEDIA_SERVICE).useValue(mediaClientMock);
    });

    app = result.app;
    authTestManager = result.authTestManager;
    postsTestManager = new PostsTestManager(app);

    const recaptchaService = app.get(RecaptchaService);
    jest.spyOn(recaptchaService, 'validate').mockResolvedValue(true);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
    jest.clearAllMocks();
    mediaClientMock.send.mockReturnValue(of([mockMediaFile]));
  });

  describe('POST /posts', () => {
    it('401 — should return Unauthorized without token', async () => {
      await postsTestManager.createPost(
        postsTestManager.validCreatePostDto(),
        '',
        HttpStatus.UNAUTHORIZED,
      );
    });

    it('400 — should return BadRequest if uploadIds is missing', async () => {
      const { accessToken } = await authTestManager.setupUser();

      await postsTestManager.createPost({}, accessToken, HttpStatus.BAD_REQUEST);
    });

    it('400 — should return BadRequest if uploadIds is empty array', async () => {
      const { accessToken } = await authTestManager.setupUser();

      await postsTestManager.createPost(
        postsTestManager.validCreatePostDto({ uploadIds: [] }),
        accessToken,
        HttpStatus.BAD_REQUEST,
      );
    });

    it('400 — should return BadRequest if description exceeds 500 chars', async () => {
      const { accessToken } = await authTestManager.setupUser();

      await postsTestManager.createPost(
        postsTestManager.validCreatePostDto({ description: 'a'.repeat(501) }),
        accessToken,
        HttpStatus.BAD_REQUEST,
      );
    });

    it('201 — should create post with valid data', async () => {
      const { accessToken } = await authTestManager.setupUser();

      const response = await postsTestManager.createPost(
        postsTestManager.validCreatePostDto(),
        accessToken,
      );

      expect(response.body).toHaveProperty('id');
      expect(typeof response.body.id).toBe('string');
    });

    it('201 — should create post with optional description', async () => {
      const { accessToken } = await authTestManager.setupUser();

      const response = await postsTestManager.createPost(
        postsTestManager.validCreatePostDto({ description: 'My awesome post' }),
        accessToken,
      );

      expect(response.body).toHaveProperty('id');
    });

    it('201 — should call media service with correct uploadIds', async () => {
      const { accessToken } = await authTestManager.setupUser();
      const uploadIds = ['upload-id-1', 'upload-id-2'];

      await postsTestManager.createPost(
        postsTestManager.validCreatePostDto({ uploadIds }),
        accessToken,
      );

      expect(mediaClientMock.send).toHaveBeenCalledWith(
        { cmd: 'consume_media_files' },
        expect.objectContaining({ uploadIds }),
      );
    });
  });
});
