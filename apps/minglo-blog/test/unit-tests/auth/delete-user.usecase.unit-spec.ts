import { Test } from '@nestjs/testing';
import {
  DeleteUserCommand,
  DeleteUserUseCase,
} from '../../../src/modules/user-account/application/usecases';
import { UserRepository } from '../../../src/modules/user-account/infrastructure';
import { LoggerService } from '@app/logger';
import { ActiveUserDto } from '../../../src/core/decorators/auth/dto';

describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase;
  let userRepo: jest.Mocked<Pick<UserRepository, 'softDeleteUser'>>;

  const activeUser: ActiveUserDto = { userId: 'public-uuid-123', deviceId: 'device-1' };

  beforeEach(async () => {
    userRepo = { softDeleteUser: jest.fn().mockResolvedValue(undefined) };

    const module = await Test.createTestingModule({
      providers: [
        DeleteUserUseCase,
        { provide: UserRepository, useValue: userRepo },
        {
          provide: LoggerService,
          useValue: { setContext: jest.fn(), log: jest.fn(), error: jest.fn(), warn: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get(DeleteUserUseCase);
  });

  it('should call userRepo.softDeleteUser with the user publicId', async () => {
    await useCase.execute(new DeleteUserCommand(activeUser));

    expect(userRepo.softDeleteUser).toHaveBeenCalledWith(activeUser.userId);
    expect(userRepo.softDeleteUser).toHaveBeenCalledTimes(1);
  });
});
