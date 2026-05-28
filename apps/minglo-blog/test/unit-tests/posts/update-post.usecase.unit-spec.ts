import { Test } from '@nestjs/testing';
import {
  UpdatePostCommand,
  UpdatePostUseCase,
} from '../../../src/modules/posts/application/usecases';
import { PostsRepository } from '../../../src/modules/posts/infrastructure/posts.repository';
import { LoggerService } from '@app/logger';
import { DomainExceptionCode } from '@app/exceptions';

const mockPost = {
  id: 1,
  userId: 10,
  user: { publicId: 'owner-public-id' },
};

describe('UpdatePostUseCase', () => {
  let useCase: UpdatePostUseCase;
  let repo: jest.Mocked<Pick<PostsRepository, 'findForUpdate' | 'updateDescription'>>;

  beforeEach(async () => {
    repo = {
      findForUpdate: jest.fn().mockResolvedValue(mockPost),
      updateDescription: jest.fn().mockResolvedValue(undefined),
    };

    const module = await Test.createTestingModule({
      providers: [
        UpdatePostUseCase,
        { provide: PostsRepository, useValue: repo },
        {
          provide: LoggerService,
          useValue: { setContext: jest.fn(), log: jest.fn(), error: jest.fn(), warn: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get(UpdatePostUseCase);
  });

  it('should call repo.findForUpdate with the given postPublicId', async () => {
    const command = new UpdatePostCommand('post-public-id', 'owner-public-id', 'new description');

    await useCase.execute(command);

    expect(repo.findForUpdate).toHaveBeenCalledWith('post-public-id');
  });

  it('should throw NotFound when post does not exist', async () => {
    repo.findForUpdate.mockResolvedValue(null);
    const command = new UpdatePostCommand('non-existent-id', 'owner-public-id', 'desc');

    await expect(useCase.execute(command)).rejects.toThrow(
      expect.objectContaining({ code: DomainExceptionCode.NotFound }),
    );
  });

  it('should throw Forbidden when user is not the post owner', async () => {
    const command = new UpdatePostCommand('post-public-id', 'another-user-id', 'desc');

    await expect(useCase.execute(command)).rejects.toThrow(
      expect.objectContaining({ code: DomainExceptionCode.Forbidden }),
    );
  });

  it('should call repo.updateDescription with post id and new description', async () => {
    const command = new UpdatePostCommand('post-public-id', 'owner-public-id', 'updated');

    await useCase.execute(command);

    expect(repo.updateDescription).toHaveBeenCalledWith(mockPost.id, 'updated');
  });

  it('should call repo.updateDescription with null when description is null', async () => {
    const command = new UpdatePostCommand('post-public-id', 'owner-public-id', null);

    await useCase.execute(command);

    expect(repo.updateDescription).toHaveBeenCalledWith(mockPost.id, null);
  });
});
