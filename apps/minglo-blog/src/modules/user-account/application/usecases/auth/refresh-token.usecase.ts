import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TokenService } from '../../services/token.service';
import { SessionRepository } from '../../../infrastructure/session.repository';
import { SessionEntity } from '../../../domains/entities/session.entity';
import { RefreshTokenResult } from '../../../api/types/refresh-token-result';
import { ActiveUserDto } from '../../../../../core/decorators/auth/dto';

export class RefreshTokenCommand {
  constructor(public readonly user: ActiveUserDto) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase implements ICommandHandler<
  RefreshTokenCommand,
  RefreshTokenResult
> {
  constructor(
    private readonly tokenService: TokenService,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async execute({ user }: RefreshTokenCommand): Promise<RefreshTokenResult> {
    const { userId, deviceId } = user;

    const accessToken = this.tokenService.createAccessToken(userId, deviceId);
    const { refreshToken, payload } = this.tokenService.createRefreshToken(userId, deviceId);

    const session: SessionEntity = await this.sessionRepository.findSessionByDeviceIdAndUserId(
      userId,
      deviceId,
    );

    session.updateTokens(payload.iat, payload.exp);
    await this.sessionRepository.updateSessionTokens(session);

    return {
      refreshToken,
      accessToken,
    };
  }
}
