import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { SessionService } from '../../application/services/session.service';
import { UserConfig } from '../../../../core/user.config';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { SessionEntity } from '../../domains/entities/session.entity';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly sessionService: SessionService,
    private readonly userConfig: UserConfig,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any) => {
          return request?.cookies?.refreshToken;
        },
      ]),
      secretOrKey: userConfig.refreshSecret,
    });
  }

  async validate(payload: RefreshTokenDto) {
    const findRefreshToken: SessionEntity | null =
      await this.sessionService.findSessionByDeviceIdAndUserId(payload.publicId, payload.deviceId);
    if (!findRefreshToken) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Session not found',
      });
    }

    const exp: number = Math.round(findRefreshToken.expiresAt.getTime() / 1000);
    const iat: number = Math.round(findRefreshToken.issuedAt.getTime() / 1000);

    if (!(exp === payload.exp && iat === payload.iat)) {
      await this.sessionService.deleteDeviceById(payload.publicId, payload.deviceId);
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Token reuse detected',
      });
    }

    return { userId: payload.publicId, deviceId: payload.deviceId };
  }
}
