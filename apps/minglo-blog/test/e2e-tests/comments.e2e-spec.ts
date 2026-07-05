import { HttpStatus, INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { of } from 'rxjs';
import { initTestSettings } from '../helpers/init-test-settings';
import { deleteAllData } from '../helpers/delete-all-data';
import { AuthTestManager, CommentsTestManager, PostsTestManager } from '../managers';
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

describe('Comments API (e2e)', () => {
  let app: INestApplication<App>;
  let authTestManager: AuthTestManager;
  let postsTestManager: PostsTestManager;
  let commentsTestManager: CommentsTestManager;
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
    commentsTestManager = new CommentsTestManager(app);

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

  describe('POST /posts/:postId/comments', () => {
    it('401 — should return Unauthorized without token', async () => {
      await commentsTestManager.createComment('any-id', 'hello', '', HttpStatus.UNAUTHORIZED);
    });

    it('404 — should return NotFound for non-existent post', async () => {
      const { accessToken } = await authTestManager.setupUser();

      await commentsTestManager.createComment(
        'non-existent-post',
        'hello',
        accessToken,
        HttpStatus.NOT_FOUND,
      );
    });

    it('201 — should create comment successfully', async () => {
      const { accessToken } = await authTestManager.setupUser();
      const post = await postsTestManager.createPost(
        postsTestManager.validCreatePostDto(),
        accessToken,
      );

      const response = await commentsTestManager.createComment(
        post.body.id,
        'Nice post!',
        accessToken,
      );

      expect(response.body).toHaveProperty('id');
      expect(typeof response.body.id).toBe('string');
    });
  });

  describe('POST /posts/:postId/comments/:commentId/replies', () => {
    it('201 — should reply to a comment successfully', async () => {
      const { accessToken } = await authTestManager.setupUser();
      const post = await postsTestManager.createPost(
        postsTestManager.validCreatePostDto(),
        accessToken,
      );
      const comment = await commentsTestManager.createComment(
        post.body.id,
        'Original comment',
        accessToken,
      );

      const response = await commentsTestManager.replyToComment(
        post.body.id,
        comment.body.id,
        'Reply text',
        accessToken,
      );

      expect(response.body).toHaveProperty('id');
    });

    it('400 — should return BadRequest when replying to a reply', async () => {
      const { accessToken } = await authTestManager.setupUser();
      const post = await postsTestManager.createPost(
        postsTestManager.validCreatePostDto(),
        accessToken,
      );
      const comment = await commentsTestManager.createComment(post.body.id, 'Comment', accessToken);
      const reply = await commentsTestManager.replyToComment(
        post.body.id,
        comment.body.id,
        'Reply',
        accessToken,
      );

      await commentsTestManager.replyToComment(
        post.body.id,
        reply.body.id,
        'Reply to reply',
        accessToken,
        HttpStatus.BAD_REQUEST,
      );
    });
  });

  describe('DELETE /posts/:postId/comments/:commentId', () => {
    it('401 — should return Unauthorized without token', async () => {
      await commentsTestManager.deleteComment('any-id', 'any-comment', '', HttpStatus.UNAUTHORIZED);
    });

    it("403 — should return Forbidden when deleting another user's comment", async () => {
      const { accessToken: ownerToken } = await authTestManager.setupUser();
      const { accessToken: otherToken } = await authTestManager.setupUser(
        authTestManager.validDto({ login: 'otherUser1', email: 'other@gmail.com' }),
      );
      const post = await postsTestManager.createPost(
        postsTestManager.validCreatePostDto(),
        ownerToken,
      );
      const comment = await commentsTestManager.createComment(
        post.body.id,
        'Owner comment',
        ownerToken,
      );

      await commentsTestManager.deleteComment(
        post.body.id,
        comment.body.id,
        otherToken,
        HttpStatus.FORBIDDEN,
      );
    });

    it('204 — should delete own comment successfully', async () => {
      const { accessToken } = await authTestManager.setupUser();
      const post = await postsTestManager.createPost(
        postsTestManager.validCreatePostDto(),
        accessToken,
      );
      const comment = await commentsTestManager.createComment(
        post.body.id,
        'My comment',
        accessToken,
      );

      await commentsTestManager.deleteComment(post.body.id, comment.body.id, accessToken);
    });
  });
});
