/**
 * Passport JWT strategy for service-to-service authentication.
 * Extracts and verifies the Bearer token from the Authorization header
 */
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { MediaConfig } from '../../core/media.config';

export interface ServiceTokenPayload {
  service: string;
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
   * функция принимает payload из jwt токена и возвращает то, что будет записано в req.user
   * @param payload
   */
  async validate(payload: ServiceTokenPayload): Promise<ServiceTokenPayload> {
    return { service: payload.service };
  }
}
