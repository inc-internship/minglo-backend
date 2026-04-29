import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { CommandBus } from '@nestjs/cqrs';
import { UserConfig } from '../../../../core/user.config';
import { OAuthLoginCommand } from '../../application/usecases';
import { RequestWithUserMetaData } from '../../application/interfaces';
import { LoginResult } from '../../api/types/login-result';
import { DomainException, DomainExceptionCode } from '@app/exceptions';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly userConfig: UserConfig,
  ) {
    super({
      clientID: userConfig.googleClientId,
      clientSecret: userConfig.googleClientSecret,
      callbackURL: userConfig.googleCallbackUrl,
      scope: ['email', 'profile'],
      passReqToCallback: true, // Прокидываем request чтобы не потерять UserMetadata
    });
  }

  async validate(
    req: RequestWithUserMetaData,
    _accessToken: string, // OAuth-токен Google — используем только здесь для получения профиля (Passport делает под капотом).
    _refreshToken: string, // OAuth refresh token — не сохраняем
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const { id, emails, displayName } = profile;
    const email = emails?.[0]?.value;

    if (!email) {
      // Теоретически невозможно для Google (email всегда есть),
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Google account has no email',
      });
    }
    const meta = req.userMeta;

    try {
      // получаем наши { accessToken, refreshToken }
      const loginResult = await this.commandBus.execute<OAuthLoginCommand, LoginResult>(
        new OAuthLoginCommand('google', id, email, displayName, meta),
      );

      // Кладём результат в req.user чтобы передать в контроллер
      done(null, loginResult);
    } catch (error) {
      done(error, false);
    }
  }
}
