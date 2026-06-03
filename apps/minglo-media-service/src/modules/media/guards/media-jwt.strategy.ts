import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { MediaConfig } from '../../core/media.config';
import { MediaType } from '@app/media/enums';

export interface ServiceTokenPayload {
  service: string;
  publicUserId: string;
  type: MediaType;
}

@Injectable()
export class MediaJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: MediaConfig) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.accessSecret,
    });
  }

  /**
   * Passport вызывает этот метод после успешной верификации токена.
   * Возвращаемый объект записывается в req.user.
   */
  async validate(payload: ServiceTokenPayload): Promise<ServiceTokenPayload> {
    return {
      service: payload.service,
      publicUserId: payload.publicUserId,
      type: payload.type,
    };
  }
}
