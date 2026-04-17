import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@app/logger';
import {
  GetTotalRegisteredUserCountQuery,
  GetTotalRegisteredUserCountQueryHandler,
} from '../../../src/modules/user-account/application/queries';
import { UserQueryRepository } from '../../../src/modules/user-account/infrastructure/queries';

describe('GetTotalRegisteredUserCountQueryHandler (Unit)', () => {
  let handler: GetTotalRegisteredUserCountQueryHandler;
  let userQueryRepository: jest.Mocked<UserQueryRepository>;

  beforeEach(async () => {
    const mockUserQueryRepository = {
      getTotalRegisteredCount: jest.fn(),
    };
    const mockLogger = {
      log: jest.fn(),
      setContext: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTotalRegisteredUserCountQueryHandler,
        { provide: UserQueryRepository, useValue: mockUserQueryRepository },
        { provide: LoggerService, useValue: mockLogger },
      ],
    }).compile();

    handler = module.get<GetTotalRegisteredUserCountQueryHandler>(
      GetTotalRegisteredUserCountQueryHandler,
    );
    userQueryRepository = module.get(UserQueryRepository);
  });

  const query = new GetTotalRegisteredUserCountQuery();

  it('should return { totalCount: 0 } when there are no registered users', async () => {
    userQueryRepository.getTotalRegisteredCount.mockResolvedValue(0);

    const result = await handler.execute(query);

    expect(result).toEqual({ totalCount: 0 });
    expect(userQueryRepository.getTotalRegisteredCount).toHaveBeenCalledTimes(1);
  });

  it('should return correct totalCount when users exist', async () => {
    userQueryRepository.getTotalRegisteredCount.mockResolvedValue(5);

    const result = await handler.execute(query);

    expect(result).toEqual({ totalCount: 5 });
    expect(userQueryRepository.getTotalRegisteredCount).toHaveBeenCalledTimes(1);
  });
});
