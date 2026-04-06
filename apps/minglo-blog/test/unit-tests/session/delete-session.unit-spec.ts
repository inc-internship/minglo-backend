import { DomainExceptionCode } from '@app/exceptions';
import {
  DeleteSessionCommand,
  DeleteSessionUseCase,
} from '../../../src/modules/user-account/application/usecases';
import { SessionRepository } from '../../../src/modules/user-account/infrastructure/session.repository';
import { LoggerService } from '@app/logger';
import { Test, TestingModule } from '@nestjs/testing';

describe('DeleteSessionUseCase (Unit)', () => {
  let useCase: DeleteSessionUseCase;
  let sessionRepository: jest.Mocked<SessionRepository>;

  beforeEach(async () => {
    const mockSessionRepository = {
      findSessionByDeviceId: jest.fn(),
      deleteDeviceById: jest.fn(),
    };
    const mockLogger = {
      log: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteSessionUseCase,
        { provide: SessionRepository, useValue: mockSessionRepository },
        { provide: LoggerService, useValue: mockLogger },
      ],
    }).compile();

    useCase = module.get<DeleteSessionUseCase>(DeleteSessionUseCase);
    sessionRepository = module.get(SessionRepository);
  });

  const mockUser = { userId: 'user-123' } as any;
  const mockDeviceId = 'device-abc';
  const command = new DeleteSessionCommand(mockUser, mockDeviceId);

  it('должен выбросить 404, если сессия не найдена', async () => {
    sessionRepository.findSessionByDeviceId.mockResolvedValue(null);

    await expect(useCase.execute(command)).rejects.toMatchObject({
      code: DomainExceptionCode.NotFound,
      message: 'Device not found',
    });
  });

  it('должен выбросить 403, если сессия чужая', async () => {
    sessionRepository.findSessionByDeviceId.mockResolvedValue({
      publicId: 'other-user',
    } as any);

    await expect(useCase.execute(command)).rejects.toMatchObject({
      code: DomainExceptionCode.Forbidden,
      message: 'Not your device',
    });
  });
  it('должен успешно удалить сессию, если все данные верны', async () => {
    sessionRepository.findSessionByDeviceId.mockResolvedValue({
      publicId: 'user-123',
    } as any);

    await useCase.execute(command);

    expect(sessionRepository.deleteDeviceById).toHaveBeenCalledWith('user-123', mockDeviceId);
  });
});
