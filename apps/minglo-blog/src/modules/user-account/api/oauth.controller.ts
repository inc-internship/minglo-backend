import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiOAuthGoogle,
  ApiOAuthGoogleCallback,
  ApiOAuthGithub,
  ApiOAuthGithubCallback,
} from '../../../core/decorators/swagger';
import { UserConfig } from '../../../core/user.config';
import { GoogleCallbackGuard, GoogleGuard } from '../guards/google.guard';
import { GithubCallbackGuard, GithubGuard } from '../guards/github.guard';
import { OAuthResult } from '../../../core/decorators/auth/oauth-result.decorator';
import { type LoginResult } from './types/login-result';
import { AuthService } from '../application/services';
import { LoggerService } from '@app/logger';

@ApiTags('OAuth 2.0')
@Controller('oauth')
export class OAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: LoggerService,
    private readonly userConfig: UserConfig,
  ) {
    this.logger.setContext(OAuthController.name);
  }

  /* Редирект пользователя на Google.
   * Passport сам делает redirect — этот метод не выполняется */
  @Get('google')
  @ApiOAuthGoogle()
  @UseGuards(GoogleGuard)
  async googleAuth(): Promise<void> {}

  /* ответ Google с code */
  @Get('google/callback')
  @ApiOAuthGoogleCallback()
  @UseGuards(GoogleCallbackGuard)
  async googleCallback(
    @OAuthResult() loginResult: LoginResult,
    @Res() res: Response,
  ): Promise<void> {
    const { accessToken, refreshToken } = loginResult;

    this.logger.log('Google OAuth callback started', 'googleCallback');

    try {
      this.authService.setRefreshTokenCookie(res, refreshToken);

      const redirectUrl = `${this.userConfig.frontendOAuthRedirectUrl}#accessToken=${accessToken}`;

      this.logger.log('Google OAuth success, redirecting to frontend', 'googleCallback');

      res.redirect(redirectUrl);
    } catch (error) {
      this.logger.error(`Google OAuth callback failed: ${error}`, 'googleCallback');

      // fallback
      res.redirect(`${this.userConfig.frontendOAuthRedirectUrl}?error=oauth_failed`);
    }
  }

  /* Редирект пользователя на GitHub.
   * Passport сам делает redirect — этот метод не выполняется */
  @Get('github')
  @ApiOAuthGithub()
  @UseGuards(GithubGuard)
  async githubAuth(): Promise<void> {}

  /* Ответ GitHub с code */
  @Get('github/callback')
  @ApiOAuthGithubCallback()
  @UseGuards(GithubCallbackGuard)
  async githubCallback(
    @OAuthResult() loginResult: LoginResult,
    @Res() res: Response,
  ): Promise<void> {
    const { accessToken, refreshToken } = loginResult;

    this.logger.log('GitHub OAuth callback started', 'githubCallback');

    try {
      this.authService.setRefreshTokenCookie(res, refreshToken);

      const redirectUrl = `${this.userConfig.frontendOAuthRedirectUrl}#accessToken=${accessToken}`;

      this.logger.log('GitHub OAuth success, redirecting to frontend', 'githubCallback');

      res.redirect(redirectUrl);
    } catch (error) {
      this.logger.error(`GitHub OAuth callback failed: ${error}`, 'githubCallback');

      res.redirect(`${this.userConfig.frontendOAuthRedirectUrl}?error=oauth_failed`);
    }
  }
}
