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

  describe('PUT /posts/:postId', () => {
    it('401 — should return Unauthorized without token', async () => {
      await postsTestManager.updatePost(
        'any-id',
        { description: 'new' },
        '',
        HttpStatus.UNAUTHORIZED,
      );
    });

    it('404 — should return NotFound for non-existent postId', async () => {
      const { accessToken } = await authTestManager.setupUser();

      await postsTestManager.updatePost(
        'non-existent-id',
        { description: 'new' },
        accessToken,
        HttpStatus.NOT_FOUND,
      );
    });

    it('403 — should return Forbidden when user is not the post owner', async () => {
      const { accessToken: ownerToken } = await authTestManager.setupUser();
      const { accessToken: otherToken } = await authTestManager.setupUser(
        authTestManager.validDto({ login: 'otherUser1', email: 'other@gmail.com' }),
      );

      const createResponse = await postsTestManager.createPost(
        postsTestManager.validCreatePostDto(),
        ownerToken,
      );

      await postsTestManager.updatePost(
        createResponse.body.id,
        { description: 'hacked' },
        otherToken,
        HttpStatus.FORBIDDEN,
      );
    });

    it('400 — should return BadRequest if description exceeds 500 chars', async () => {
      const { accessToken } = await authTestManager.setupUser();

      const createResponse = await postsTestManager.createPost(
        postsTestManager.validCreatePostDto(),
        accessToken,
      );

      await postsTestManager.updatePost(
        createResponse.body.id,
        { description: 'a'.repeat(501) },
        accessToken,
        HttpStatus.BAD_REQUEST,
      );
    });

    it('204 — should update post description successfully', async () => {
      const { accessToken } = await authTestManager.setupUser();

      const createResponse = await postsTestManager.createPost(
        postsTestManager.validCreatePostDto(),
        accessToken,
      );
      const postId = createResponse.body.id;

      await postsTestManager.updatePost(
        postId,
        { description: 'Updated description' },
        accessToken,
      );

      const getResponse = await postsTestManager.getPostById(postId);
      expect(getResponse.body.description).toBe('Updated description');
    });

    it('400 — should return BadRequest if description is omitted', async () => {
      const { accessToken } = await authTestManager.setupUser();

      const createResponse = await postsTestManager.createPost(
        postsTestManager.validCreatePostDto(),
        accessToken,
      );

      await postsTestManager.updatePost(
        createResponse.body.id,
        {},
        accessToken,
        HttpStatus.BAD_REQUEST,
      );
    });

    it('204 — should set description to null when explicitly passed as null', async () => {
      const { accessToken } = await authTestManager.setupUser();

      const createResponse = await postsTestManager.createPost(
        postsTestManager.validCreatePostDto({ description: 'initial' }),
        accessToken,
      );
      const postId = createResponse.body.id;

      await postsTestManager.updatePost(postId, { description: null }, accessToken);

      const getResponse = await postsTestManager.getPostById(postId);
      expect(getResponse.body.description).toBeNull();
    });
  });

  describe('DELETE /posts/:postId', () => {
    it('401 — should return Unauthorized without token', async () => {
      await postsTestManager.deletePost('any-id', '', HttpStatus.UNAUTHORIZED);
    });

    it('404 — should return NotFound for non-existent postId', async () => {
      const { accessToken } = await authTestManager.setupUser();

      await postsTestManager.deletePost('non-existent-id', accessToken, HttpStatus.NOT_FOUND);
    });

    it('403 — should return Forbidden when user is not the post owner', async () => {
      const { accessToken: ownerToken } = await authTestManager.setupUser();
      const { accessToken: otherToken } = await authTestManager.setupUser(
        authTestManager.validDto({ login: 'otherUser1', email: 'other@gmail.com' }),
      );

      const createResponse = await postsTestManager.createPost(
        postsTestManager.validCreatePostDto(),
        ownerToken,
      );

      await postsTestManager.deletePost(createResponse.body.id, otherToken, HttpStatus.FORBIDDEN);
    });

    it('204 — should delete post successfully', async () => {
      const { accessToken } = await authTestManager.setupUser();

      const createResponse = await postsTestManager.createPost(
        postsTestManager.validCreatePostDto(),
        accessToken,
      );
      const postId = createResponse.body.id;

      await postsTestManager.deletePost(postId, accessToken);
    });

    it('404 — deleted post should no longer be accessible via GET', async () => {
      const { accessToken } = await authTestManager.setupUser();

      const createResponse = await postsTestManager.createPost(
        postsTestManager.validCreatePostDto(),
        accessToken,
      );
      const postId = createResponse.body.id;

      await postsTestManager.deletePost(postId, accessToken);
      await postsTestManager.getPostById(postId, HttpStatus.NOT_FOUND);
    });
  });

  describe('GET /posts/user/:userId', () => {
    it('200 — should return empty list for non-existent userId', async () => {
      const response = await postsTestManager.getUserPosts('non-existent-user-id');

      expect(response.body).toMatchObject({
        items: [],
        hasNextPage: false,
        nextCursor: null,
      });
    });

    it('200 — should return empty list when user has no posts', async () => {
      const { accessToken } = await authTestManager.setupUser();
      const { body: me } = await authTestManager.me(accessToken);

      const response = await postsTestManager.getUserPosts(me.publicId);

      expect(response.body).toMatchObject({
        items: [],
        hasNextPage: false,
        nextCursor: null,
      });
    });

    it('200 — should return correct response shape', async () => {
      const { accessToken } = await authTestManager.setupUser();
      const { body: me } = await authTestManager.me(accessToken);

      await postsTestManager.createPost(postsTestManager.validCreatePostDto(), accessToken);

      const response = await postsTestManager.getUserPosts(me.publicId);

      expect(response.body).toMatchObject({
        items: expect.any(Array),
        hasNextPage: false,
        nextCursor: null,
      });
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0]).toMatchObject({
        id: expect.any(String),
        description: null,
        images: expect.any(Array),
        owner: expect.objectContaining({
          id: me.publicId,
          login: me.login,
        }),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('200 — should not return other users posts', async () => {
      const { accessToken: ownerToken } = await authTestManager.setupUser();
      const { accessToken: otherToken } = await authTestManager.setupUser(
        authTestManager.validDto({ login: 'otherUser1', email: 'other@gmail.com' }),
      );
      const { body: me } = await authTestManager.me(ownerToken);

      await postsTestManager.createPost(postsTestManager.validCreatePostDto(), ownerToken);
      await postsTestManager.createPost(postsTestManager.validCreatePostDto(), otherToken);

      const response = await postsTestManager.getUserPosts(me.publicId);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].owner.id).toBe(me.publicId);
    });

    it('200 — should not return deleted posts', async () => {
      const { accessToken } = await authTestManager.setupUser();
      const { body: me } = await authTestManager.me(accessToken);

      const createResponse = await postsTestManager.createPost(
        postsTestManager.validCreatePostDto(),
        accessToken,
      );
      await postsTestManager.deletePost(createResponse.body.id, accessToken);

      const response = await postsTestManager.getUserPosts(me.publicId);

      expect(response.body.items).toHaveLength(0);
      expect(response.body.hasNextPage).toBe(false);
    });

    it('200 — should return posts ordered by createdAt desc', async () => {
      const { accessToken } = await authTestManager.setupUser();
      const { body: me } = await authTestManager.me(accessToken);

      const first = await postsTestManager.createPost(
        postsTestManager.validCreatePostDto({ description: 'first' }),
        accessToken,
      );
      const second = await postsTestManager.createPost(
        postsTestManager.validCreatePostDto({ description: 'second' }),
        accessToken,
      );

      const response = await postsTestManager.getUserPosts(me.publicId);

      expect(response.body.items[0].id).toBe(second.body.id);
      expect(response.body.items[1].id).toBe(first.body.id);
    });

    it('200 — should return hasNextPage true and nextCursor when more posts exist', async () => {
      const { accessToken } = await authTestManager.setupUser();
      const { body: me } = await authTestManager.me(accessToken);

      for (let i = 0; i < 9; i++) {
        await postsTestManager.createPost(postsTestManager.validCreatePostDto(), accessToken);
      }

      const response = await postsTestManager.getUserPosts(me.publicId);

      expect(response.body.items).toHaveLength(8);
      expect(response.body.hasNextPage).toBe(true);
      expect(response.body.nextCursor).toBeTruthy();
    });

    it('200 — should return remaining posts on second page using cursor', async () => {
      const { accessToken } = await authTestManager.setupUser();
      const { body: me } = await authTestManager.me(accessToken);

      for (let i = 0; i < 9; i++) {
        await postsTestManager.createPost(postsTestManager.validCreatePostDto(), accessToken);
      }

      const firstPage = await postsTestManager.getUserPosts(me.publicId);
      const cursor = firstPage.body.nextCursor;

      const secondPage = await postsTestManager.getUserPosts(me.publicId, cursor);

      expect(secondPage.body.items).toHaveLength(1);
      expect(secondPage.body.hasNextPage).toBe(false);
      expect(secondPage.body.nextCursor).toBeNull();
    });

    it('200 — second page items should not overlap with first page', async () => {
      const { accessToken } = await authTestManager.setupUser();
      const { body: me } = await authTestManager.me(accessToken);

      for (let i = 0; i < 9; i++) {
        await postsTestManager.createPost(postsTestManager.validCreatePostDto(), accessToken);
      }

      const firstPage = await postsTestManager.getUserPosts(me.publicId);
      const secondPage = await postsTestManager.getUserPosts(
        me.publicId,
        firstPage.body.nextCursor,
      );

      const firstPageIds = firstPage.body.items.map((p: { id: string }) => p.id);
      const secondPageIds = secondPage.body.items.map((p: { id: string }) => p.id);
      const overlap = firstPageIds.filter((id: string) => secondPageIds.includes(id));

      expect(overlap).toHaveLength(0);
    });
  });

  describe('GET /posts/:postId', () => {
    it('404 — should return NotFound for non-existent postId', async () => {
      await postsTestManager.getPostById('non-existent-id', HttpStatus.NOT_FOUND);
    });

    it('200 — should return post by id', async () => {
      const { accessToken } = await authTestManager.setupUser();

      const createResponse = await postsTestManager.createPost(
        postsTestManager.validCreatePostDto(),
        accessToken,
      );

      const postId = createResponse.body.id;

      const response = await postsTestManager.getPostById(postId);

      expect(response.body).toMatchObject({
        id: postId,
        description: null,
        images: expect.any(Array),
        owner: expect.objectContaining({
          id: expect.any(String),
          login: expect.any(String),
        }),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('200 — should return post with description when set', async () => {
      const { accessToken } = await authTestManager.setupUser();
      const description = 'My awesome post description';

      const createResponse = await postsTestManager.createPost(
        postsTestManager.validCreatePostDto({ description }),
        accessToken,
      );

      const postId = createResponse.body.id;

      const response = await postsTestManager.getPostById(postId);

      expect(response.body.description).toBe(description);
    });

    it('200 — should return post with images array containing media file data', async () => {
      const { accessToken } = await authTestManager.setupUser();

      const createResponse = await postsTestManager.createPost(
        postsTestManager.validCreatePostDto(),
        accessToken,
      );

      const postId = createResponse.body.id;

      const response = await postsTestManager.getPostById(postId);

      expect(response.body.images).toHaveLength(1);
      expect(response.body.images[0]).toMatchObject({
        id: expect.any(String),
        url: expect.any(String),
        width: expect.any(Number),
        height: expect.any(Number),
        mimeType: expect.any(String),
        fileSize: expect.any(Number),
      });
    });
  });
});
