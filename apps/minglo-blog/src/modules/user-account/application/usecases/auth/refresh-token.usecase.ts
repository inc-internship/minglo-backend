import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TokenService } from '../../services/token.service';
import { SessionRepository } from '../../../infrastructure/session.repository';
import { SessionEntity } from '../../../domains/entities/session.entity';
import { ActiveUserDto } from '../../../../../core/decorators/auth/dto/active-user.dto';
import { RefreshTokenResult } from '../../../api/types/refresh-token-result';

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

  async execute(command: RefreshTokenCommand): Promise<RefreshTokenResult> {
    const { user } = command;

    const accessToken: string = this.tokenService.createAccessToken(user.userId, user.deviceId);
    const { refreshToken, payload } = this.tokenService.createRefreshToken(
      user.userId,
      user.deviceId,
    );

    const session: SessionEntity = await this.sessionRepository.findSessionByDeviceIdAndUserId(
      user.userId,
      user.deviceId,
    );

    session.updateTokens(payload.iat, payload.exp);
    await this.sessionRepository.updateSessionTokens(session);

    return {
      refreshToken: refreshToken,
      accessToken: accessToken,
    };
  }
}
