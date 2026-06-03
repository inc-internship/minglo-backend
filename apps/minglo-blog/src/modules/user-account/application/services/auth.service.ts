import type { Response } from 'express';
import { UserConfig } from '../../../../core/user.config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(private readonly userConfig: UserConfig) {}

  /** Sets the refresh token as an httpOnly cookie on the response. */
  setRefreshTokenCookie(res: Response, refreshToken: string): void {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: this.userConfig.maxAgeRefreshToken * 1000,
    });
  }
}
