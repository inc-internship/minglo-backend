import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AccessTokenDto } from '../dto/access-token.dto';
import { SessionService } from '../../application/services/session.service';
import { SessionEntity } from '../../domains/entities/session.entity';
import { UserConfig } from '../../../../core/user.config';

@Injectable()
export class AccessStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly sessionService: SessionService,
    private readonly userConfig: UserConfig,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: userConfig.accessSecret,
    });
  }

  async validate(payload: AccessTokenDto) {
    const session: SessionEntity = await this.sessionService.findSessionByDeviceIdAndUserId(
      payload.publicId,
      payload.deviceId,
    );
    session.updateActivity();
    await this.sessionService.updateLastActive(session);
    return { userId: payload.publicId, deviceId: payload.deviceId };
  }
}
