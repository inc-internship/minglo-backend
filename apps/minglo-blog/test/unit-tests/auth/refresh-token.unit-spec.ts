import { Test, TestingModule } from '@nestjs/testing';
import {
  RefreshTokenCommand,
  RefreshTokenUseCase,
} from '../../../src/modules/user-account/application/usecases';
import { TokenService } from '../../../src/modules/user-account/application/services/token.service';
import { SessionRepository } from '../../../src/modules/user-account/infrastructure/session.repository';

describe('RefreshTokenUseCase Unit Tests', () => {
  let useCase: RefreshTokenUseCase;
  let tokenService: jest.Mocked<TokenService>;
  let sessionRepository: jest.Mocked<SessionRepository>;

  const command = new RefreshTokenCommand({ userId: 'u1', deviceId: 'd1' });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenUseCase,
        {
          provide: TokenService,
          useValue: {
            createAccessToken: jest.fn(),
            createRefreshToken: jest.fn(),
          },
        },
        {
          provide: SessionRepository,
          useValue: {
            findSessionByDeviceIdAndUserId: jest.fn(),
            updateSessionTokens: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get(RefreshTokenUseCase);
    tokenService = module.get(TokenService);
    sessionRepository = module.get(SessionRepository);
  });

  it('должен успешно обновить токены и сохранить их в базу', async () => {
    const mockPayload = { iat: 100, exp: 200 };
    const mockSession = { updateTokens: jest.fn() } as any;

    tokenService.createAccessToken.mockReturnValue('at');
    tokenService.createRefreshToken.mockReturnValue({
      refreshToken: 'rt',
      payload: mockPayload as any,
    });
    sessionRepository.findSessionByDeviceIdAndUserId.mockResolvedValue(mockSession);

    const result = await useCase.execute(command);

    expect(mockSession.updateTokens).toHaveBeenCalledWith(mockPayload.iat, mockPayload.exp);
    expect(sessionRepository.updateSessionTokens).toHaveBeenCalledWith(mockSession);
    expect(result).toEqual({ accessToken: 'at', refreshToken: 'rt' });
  });

  it('должен выбросить ошибку, если сессия не найдена (не переходя к сохранению)', async () => {
    tokenService.createAccessToken.mockReturnValue('at');
    tokenService.createRefreshToken.mockReturnValue({
      refreshToken: 'rt',
      payload: { iat: 1, exp: 2 } as any,
    });

    sessionRepository.findSessionByDeviceIdAndUserId.mockRejectedValue(
      new Error('Session not found'),
    );

    await expect(useCase.execute(command)).rejects.toThrow('Session not found');

    expect(sessionRepository.updateSessionTokens).not.toHaveBeenCalled();
  });
});
