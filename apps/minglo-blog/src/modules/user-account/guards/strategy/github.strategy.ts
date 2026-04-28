import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { CommandBus } from '@nestjs/cqrs';
import { UserConfig } from '../../../../core/user.config';
import { OAuthLoginCommand } from '../../application/usecases';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { RequestWithUserMetaData } from '../../application/interfaces';
import { LoginResult } from '../../api/types/login-result';
import { VerifyCallback } from 'passport-oauth2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly userConfig: UserConfig,
  ) {
    super({
      clientID: userConfig.githubClientId,
      clientSecret: userConfig.githubClientSecret,
      callbackURL: userConfig.githubCallbackUrl,
      scope: ['user:email'], // без этого email будет пустым у приватных аккаунтов
      passReqToCallback: true,
    });
  }

  async validate(
    req: RequestWithUserMetaData,
    _accessToken: string, // OAuth-токен GitHub — используем только здесь для получения профиля (Passport делает под капотом).
    _refreshToken: string, // OAuth refresh token — не сохраняем
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const { id, emails, displayName, username } = profile;

    // GitHub возвращает null если пользователь скрыл email
    const email = emails?.[0]?.value ?? null;

    if (!email) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email is required. Please make your GitHub email public and try again.',
      });
    }

    const meta = req.userMeta;

    const loginResult = await this.commandBus.execute<OAuthLoginCommand, LoginResult>(
      new OAuthLoginCommand(
        'github',
        String(id),
        email,
        displayName || username || 'github_user',
        meta,
      ),
    );

    done(null, loginResult);
  }
}
