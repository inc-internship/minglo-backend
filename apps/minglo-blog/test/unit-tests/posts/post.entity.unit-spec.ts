import { PostEntity } from '../../../src/modules/posts/domains/entities';
import { DomainException } from '@app/exceptions';
import { MediaMimeType } from '@app/media/enums';
import { PostMediaFileMetaData } from '../../../src/modules/posts/mappers/media-file-metadata.mapper';

const makeMediaItem = (override: Partial<PostMediaFileMetaData> = {}): PostMediaFileMetaData => ({
  url: 'https://s3.example.com/image.webp',
  key: 'posts/user123/image.webp',
  mimeType: MediaMimeType.IMAGE_WEBP,
  width: 800,
  height: 600,
  fileSize: 12345,
  ...override,
});

describe('PostEntity', () => {
  const userId = 1;
  const validMedia = [makeMediaItem()];

  describe('create()', () => {
    it('should create entity with valid data', () => {
      const post = PostEntity.create({ userId, media: validMedia });

      expect(post.getUserId()).toBe(userId);
      expect(post.getDescription()).toBeNull();
      expect(post.getMedia()).toHaveLength(1);
    });

    it('should create entity with description', () => {
      const post = PostEntity.create({ userId, media: validMedia, description: 'My post' });

      expect(post.getDescription()).toBe('My post');
    });

    it('should set description to null if not provided', () => {
      const post = PostEntity.create({ userId, media: validMedia });

      expect(post.getDescription()).toBeNull();
    });

    it('should assign order by index to media files', () => {
      const media = [makeMediaItem(), makeMediaItem(), makeMediaItem()];
      const post = PostEntity.create({ userId, media });

      expect(post.getMedia()[0].getOrder()).toBe(0);
      expect(post.getMedia()[1].getOrder()).toBe(1);
      expect(post.getMedia()[2].getOrder()).toBe(2);
    });

    it('should throw if description exceeds 500 chars', () => {
      expect(() =>
        PostEntity.create({ userId, media: validMedia, description: 'a'.repeat(501) }),
      ).toThrow(DomainException);
    });

    it('should pass if description is exactly 500 chars', () => {
      expect(() =>
        PostEntity.create({ userId, media: validMedia, description: 'a'.repeat(500) }),
      ).not.toThrow();
    });

    // NOTE: the condition in PostEntity.create() uses && instead of ||:
    //   if (media.length < 1 && media.length > 10) — this is always false
    // These tests reflect the CORRECT expected behavior and will fail until the bug is fixed.
    it('should throw if media array is empty', () => {
      expect(() => PostEntity.create({ userId, media: [] })).toThrow(DomainException);
    });

    it('should throw if media array has more than 10 files', () => {
      const media = Array.from({ length: 11 }, () => makeMediaItem());
      expect(() => PostEntity.create({ userId, media })).toThrow(DomainException);
    });

    it('should pass with exactly 1 media file', () => {
      expect(() => PostEntity.create({ userId, media: [makeMediaItem()] })).not.toThrow();
    });

    it('should pass with exactly 10 media files', () => {
      const media = Array.from({ length: 10 }, () => makeMediaItem());
      expect(() => PostEntity.create({ userId, media })).not.toThrow();
    });
  });
});
