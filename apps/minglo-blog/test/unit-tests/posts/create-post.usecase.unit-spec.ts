import { Test } from '@nestjs/testing';
import { of } from 'rxjs';
import { MEDIA_SERVICE } from '@app/media/constants';
import { MediaMimeType } from '@app/media/enums';
import { MediaFileMetaDataViewDto } from '@app/media/api/view-dto';
import {
  CreatePostCommand,
  CreatePostUseCase,
} from '../../../src/modules/posts/application/usecases';
import { PostsRepository } from '../../../src/modules/posts/infrastructure/posts.repository';
import { UserQueryRepository } from '../../../src/modules/user-account/infrastructure/queries/user.query.repository';
import { LoggerService } from '@app/logger';

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

describe('CreatePostUseCase', () => {
  let useCase: CreatePostUseCase;
  let mediaClient: { send: jest.Mock };
  let userQueryRepo: jest.Mocked<Pick<UserQueryRepository, 'findIdByPublicId'>>;
  let postsRepo: jest.Mocked<Pick<PostsRepository, 'create'>>;

  beforeEach(async () => {
    mediaClient = { send: jest.fn().mockReturnValue(of([mockMediaFile])) };
    userQueryRepo = { findIdByPublicId: jest.fn().mockResolvedValue(1) };
    postsRepo = { create: jest.fn().mockResolvedValue('post-public-id') };

    const module = await Test.createTestingModule({
      providers: [
        CreatePostUseCase,
        { provide: MEDIA_SERVICE, useValue: mediaClient },
        { provide: UserQueryRepository, useValue: userQueryRepo },
        { provide: PostsRepository, useValue: postsRepo },
        {
          provide: LoggerService,
          useValue: { setContext: jest.fn(), log: jest.fn(), error: jest.fn(), warn: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get(CreatePostUseCase);
  });

  it('should resolve userId by publicUserId', async () => {
    const command = new CreatePostCommand(
      { uploadIds: ['upload-1'], description: 'My post' },
      'public-user-id',
    );

    await useCase.execute(command);

    expect(userQueryRepo.findIdByPublicId).toHaveBeenCalledWith('public-user-id');
  });

  it('should call media service with correct params', async () => {
    const command = new CreatePostCommand(
      { uploadIds: ['upload-1', 'upload-2'] },
      'public-user-id',
    );

    await useCase.execute(command);

    expect(mediaClient.send).toHaveBeenCalledWith(
      { cmd: 'consume_media_files' },
      { uploadIds: ['upload-1', 'upload-2'], publicUserId: 'public-user-id' },
    );
  });

  it('should return object with id', async () => {
    const command = new CreatePostCommand({ uploadIds: ['upload-1'] }, 'public-user-id');

    const result = await useCase.execute(command);

    expect(result).toHaveProperty('id');
    expect(typeof result.id).toBe('string');
  });
});
