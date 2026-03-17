import { Injectable } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { CoreConfig } from '../../../../core/core.config';

@Injectable()
export class JwtService {
  constructor(private coreConfigService: CoreConfig) {}

  createAccessToken(userId: string): string {
    return jwt.sign({ userId }, this.coreConfigService.accessSecret, {
      expiresIn: this.coreConfigService.maxAgeAccessToken,
    });
  }

  createRefreshToken(userId: string): string {
    return jwt.sign({ userId }, this.coreConfigService.refreshSecret, {
      expiresIn: this.coreConfigService.maxAgeRefreshToken,
    });
  }
}
