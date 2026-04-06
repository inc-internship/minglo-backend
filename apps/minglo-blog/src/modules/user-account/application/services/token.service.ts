import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserConfig } from '../../../../core/user.config';

export interface JwtPayload {
  iat: number;
  exp: number;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private userConfig: UserConfig,
  ) {}

  createAccessToken(publicId: string, deviceId: string): string {
    const payload = { publicId, deviceId };

    return this.jwtService.sign(payload, {
      secret: this.userConfig.accessSecret,
      expiresIn: this.userConfig.maxAgeAccessToken,
    });
  }

  createRefreshToken(publicId: string, deviceId: string) {
    const payload = { publicId, deviceId };

    const refreshToken: string = this.jwtService.sign(payload, {
      secret: this.userConfig.refreshSecret,
      expiresIn: this.userConfig.maxAgeRefreshToken,
    });
    const decoded: JwtPayload = this.jwtService.decode(refreshToken);

    return {
      refreshToken,
      payload: {
        iat: decoded.iat,
        exp: decoded.exp,
      },
    };
  }
}
