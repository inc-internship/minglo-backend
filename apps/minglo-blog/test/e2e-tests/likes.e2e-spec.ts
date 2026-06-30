import { HttpStatus, INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { of } from 'rxjs';
import { initTestSettings } from '../helpers/init-test-settings';
import { deleteAllData } from '../helpers/delete-all-data';
import {
  AuthTestManager,
  CommentsTestManager,
  LikesTestManager,
  PostsTestManager,
} from '../managers';
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

describe('Likes API (e2e)', () => {
  let app: INestApplication<App>;
  let authTestManager: AuthTestManager;
  let postsTestManager: PostsTestManager;
  let commentsTestManager: CommentsTestManager;
  let likesTestManager: LikesTestManager;
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
    likesTestManager = new LikesTestManager(app);

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

  describe('POST /posts/:postId/likes', () => {
    it('401 — should return Unauthorized without token', async () => {
      await likesTestManager.likePost('any-id', '', HttpStatus.UNAUTHORIZED);
    });

    it('404 — should return NotFound for non-existent post', async () => {
      const { accessToken } = await authTestManager.setupUser();

      await likesTestManager.likePost('non-existent-id', accessToken, HttpStatus.NOT_FOUND);
    });

    it('201 — should like a post successfully', async () => {
      const { accessToken } = await authTestManager.setupUser();
      const post = await postsTestManager.createPost(
        postsTestManager.validCreatePostDto(),
        accessToken,
      );

      await likesTestManager.likePost(post.body.id, accessToken);
    });

    it('409 — should return Conflict when liking the same post twice', async () => {
      const { accessToken } = await authTestManager.setupUser();
      const post = await postsTestManager.createPost(
        postsTestManager.validCreatePostDto(),
        accessToken,
      );

      await likesTestManager.likePost(post.body.id, accessToken);
      await likesTestManager.likePost(post.body.id, accessToken, HttpStatus.CONFLICT);
    });
  });

  describe('DELETE /posts/:postId/likes', () => {
    it('401 — should return Unauthorized without token', async () => {
      await likesTestManager.unlikePost('any-id', '', HttpStatus.UNAUTHORIZED);
    });

    it('404 — should return NotFound when post was not liked', async () => {
      const { accessToken } = await authTestManager.setupUser();
      const post = await postsTestManager.createPost(
        postsTestManager.validCreatePostDto(),
        accessToken,
      );

      await likesTestManager.unlikePost(post.body.id, accessToken, HttpStatus.NOT_FOUND);
    });

    it('204 — should unlike a post successfully', async () => {
      const { accessToken } = await authTestManager.setupUser();
      const post = await postsTestManager.createPost(
        postsTestManager.validCreatePostDto(),
        accessToken,
      );

      await likesTestManager.likePost(post.body.id, accessToken);
      await likesTestManager.unlikePost(post.body.id, accessToken);
    });
  });

  describe('POST /posts/:postId/comments/:commentId/likes', () => {
    it('401 — should return Unauthorized without token', async () => {
      await likesTestManager.likeComment('any-post', 'any-comment', '', HttpStatus.UNAUTHORIZED);
    });

    it('201 — should like a comment successfully', async () => {
      const { accessToken } = await authTestManager.setupUser();
      const post = await postsTestManager.createPost(
        postsTestManager.validCreatePostDto(),
        accessToken,
      );
      const comment = await commentsTestManager.createComment(
        post.body.id,
        'Great post',
        accessToken,
      );

      await likesTestManager.likeComment(post.body.id, comment.body.id, accessToken);
    });

    it('409 — should return Conflict when liking the same comment twice', async () => {
      const { accessToken } = await authTestManager.setupUser();
      const post = await postsTestManager.createPost(
        postsTestManager.validCreatePostDto(),
        accessToken,
      );
      const comment = await commentsTestManager.createComment(post.body.id, 'Nice', accessToken);

      await likesTestManager.likeComment(post.body.id, comment.body.id, accessToken);
      await likesTestManager.likeComment(
        post.body.id,
        comment.body.id,
        accessToken,
        HttpStatus.CONFLICT,
      );
    });
  });

  describe('GET /posts/:postId/likes', () => {
    it('200 — should return empty list when no likes', async () => {
      const { accessToken } = await authTestManager.setupUser();
      const post = await postsTestManager.createPost(
        postsTestManager.validCreatePostDto(),
        accessToken,
      );

      const response = await likesTestManager.getPostLikes(post.body.id);

      expect(response.body).toMatchObject({
        items: [],
        hasNextPage: false,
        nextCursor: null,
      });
    });

    it('200 — should return user who liked the post', async () => {
      const { accessToken } = await authTestManager.setupUser();
      const { body: me } = await authTestManager.me(accessToken);
      const post = await postsTestManager.createPost(
        postsTestManager.validCreatePostDto(),
        accessToken,
      );

      await likesTestManager.likePost(post.body.id, accessToken);

      const response = await likesTestManager.getPostLikes(post.body.id);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0]).toMatchObject({
        id: me.publicId,
        login: me.login,
        avatarUrl: null,
        likedAt: expect.any(String),
      });
    });
  });
});
