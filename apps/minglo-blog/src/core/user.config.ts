import { Injectable } from '@nestjs/common';
import { IsNumber, IsString } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { configValidationUtility } from '@app/dynamic-config';

@Injectable()
export class UserConfig {
  //ACCESS TOKEN
  @IsString({ message: 'Set environment variable ACCESS_SECRET' })
  accessSecret: string;
  @IsNumber({}, { message: 'Set environment variable MAX_AGE_ACCESS_TOKEN' })
  maxAgeAccessToken: number;

  //REFRESH TOKEN
  @IsString({ message: 'Set environment variable REFRESH_SECRET' })
  refreshSecret: string;
  @IsNumber({}, { message: 'Set environment variable MAX_AGE_REFRESH_TOKEN' })
  maxAgeRefreshToken: number;

  // Google OAuth
  @IsString()
  googleClientId: string;
  @IsString()
  googleClientSecret: string;
  @IsString()
  googleCallbackUrl: string;

  // GitHub OAuth
  @IsString()
  githubClientId: string;
  @IsString()
  githubClientSecret: string;
  @IsString()
  githubCallbackUrl: string;

  // Frontend redirect
  @IsString()
  frontendOAuthRedirectUrl: string;

  constructor(private configService: ConfigService<any, true>) {
    this.accessSecret = this.configService.get('ACCESS_SECRET');
    this.maxAgeAccessToken = Number(this.configService.get('MAX_AGE_ACCESS_TOKEN'));

    this.refreshSecret = this.configService.get('REFRESH_SECRET');
    this.maxAgeRefreshToken = Number(this.configService.get('MAX_AGE_REFRESH_TOKEN'));

    this.googleClientId = this.configService.get('GOOGLE_CLIENT_ID');
    this.googleClientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
    this.googleCallbackUrl = this.configService.get('GOOGLE_CALLBACK_URL');

    this.githubClientId = this.configService.get('GITHUB_CLIENT_ID');
    this.githubClientSecret = this.configService.get('GITHUB_CLIENT_SECRET');
    this.githubCallbackUrl = this.configService.get('GITHUB_CALLBACK_URL');

    this.frontendOAuthRedirectUrl = this.configService.get('FRONTEND_OAUTH_REDIRECT_URL');
    configValidationUtility.validateConfig(this);
  }
}
