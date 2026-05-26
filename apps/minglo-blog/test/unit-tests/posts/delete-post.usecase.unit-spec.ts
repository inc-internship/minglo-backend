import { Test } from '@nestjs/testing';
import {
  DeletePostCommand,
  DeletePostUseCase,
} from '../../../src/modules/posts/application/usecases';
import { PostsRepository } from '../../../src/modules/posts/infrastructure/posts.repository';
import { LoggerService } from '@app/logger';
import { DomainExceptionCode } from '@app/exceptions';

const mockPost = {
  id: 1,
  userId: 10,
  user: { publicId: 'owner-public-id' },
};

describe('DeletePostUseCase', () => {
  let useCase: DeletePostUseCase;
  let repo: jest.Mocked<Pick<PostsRepository, 'findForUpdate' | 'softDelete'>>;

  beforeEach(async () => {
    repo = {
      findForUpdate: jest.fn().mockResolvedValue(mockPost),
      softDelete: jest.fn().mockResolvedValue(undefined),
    };

    const module = await Test.createTestingModule({
      providers: [
        DeletePostUseCase,
        { provide: PostsRepository, useValue: repo },
        {
          provide: LoggerService,
          useValue: { setContext: jest.fn(), log: jest.fn(), error: jest.fn(), warn: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get(DeletePostUseCase);
  });

  it('should call repo.findForUpdate with the given postPublicId', async () => {
    const command = new DeletePostCommand('post-public-id', 'owner-public-id');

    await useCase.execute(command);

    expect(repo.findForUpdate).toHaveBeenCalledWith('post-public-id');
  });

  it('should throw NotFound when post does not exist', async () => {
    repo.findForUpdate.mockResolvedValue(null);
    const command = new DeletePostCommand('non-existent-id', 'owner-public-id');

    await expect(useCase.execute(command)).rejects.toThrow(
      expect.objectContaining({ code: DomainExceptionCode.NotFound }),
    );
  });

  it('should throw Forbidden when user is not the post owner', async () => {
    const command = new DeletePostCommand('post-public-id', 'another-user-id');

    await expect(useCase.execute(command)).rejects.toThrow(
      expect.objectContaining({ code: DomainExceptionCode.Forbidden }),
    );
  });

  it('should call repo.softDelete with the post internal id', async () => {
    const command = new DeletePostCommand('post-public-id', 'owner-public-id');

    await useCase.execute(command);

    expect(repo.softDelete).toHaveBeenCalledWith(mockPost.id);
  });

  it('should not call repo.softDelete when post is not found', async () => {
    repo.findForUpdate.mockResolvedValue(null);
    const command = new DeletePostCommand('non-existent-id', 'owner-public-id');

    await expect(useCase.execute(command)).rejects.toThrow();

    expect(repo.softDelete).not.toHaveBeenCalled();
  });
});
