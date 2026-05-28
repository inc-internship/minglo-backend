import { Test } from '@nestjs/testing';
import {
  GetPostByIdQuery,
  GetPostByIdQueryHandler,
} from '../../../src/modules/posts/application/query';
import { PostQueryRepository } from '../../../src/modules/posts/infrastructure/query';
import { PostViewDto } from '../../../src/modules/posts/api/view-dto';
import { LoggerService } from '@app/logger';
import { DomainException, DomainExceptionCode } from '@app/exceptions';

const mockPostView: PostViewDto = {
  id: 'post-public-id',
  description: 'Test description',
  images: [
    {
      id: 'media-public-id',
      url: 'https://s3.example.com/image.webp',
      width: 800,
      height: 600,
      mimeType: 'image/webp',
      fileSize: 12345,
    },
  ],
  owner: {
    id: 'user-public-id',
    login: 'testuser',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('GetPostByIdQueryHandler', () => {
  let handler: GetPostByIdQueryHandler;
  let queryRepo: jest.Mocked<Pick<PostQueryRepository, 'findByPublicIdOrFail'>>;

  beforeEach(async () => {
    queryRepo = { findByPublicIdOrFail: jest.fn().mockResolvedValue(mockPostView) };

    const module = await Test.createTestingModule({
      providers: [
        GetPostByIdQueryHandler,
        { provide: PostQueryRepository, useValue: queryRepo },
        {
          provide: LoggerService,
          useValue: { setContext: jest.fn(), log: jest.fn(), error: jest.fn(), warn: jest.fn() },
        },
      ],
    }).compile();

    handler = module.get(GetPostByIdQueryHandler);
  });

  it('should call queryRepo.findByPublicIdOrFail with the given postPublicId', async () => {
    const query = new GetPostByIdQuery('post-public-id');

    await handler.execute(query);

    expect(queryRepo.findByPublicIdOrFail).toHaveBeenCalledWith('post-public-id');
  });

  it('should return the PostViewDto from the repository', async () => {
    const query = new GetPostByIdQuery('post-public-id');

    const result = await handler.execute(query);

    expect(result).toEqual(mockPostView);
  });

  it('should propagate DomainException when post is not found', async () => {
    queryRepo.findByPublicIdOrFail.mockRejectedValue(
      new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
        extensions: [{ field: 'postId', message: 'Post not found' }],
      }),
    );

    const query = new GetPostByIdQuery('non-existent-id');

    await expect(handler.execute(query)).rejects.toThrow(DomainException);
  });
});
