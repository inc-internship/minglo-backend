import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { UserMetadata } from '../../../../../core/decorators/auth/user-agent.decorator';
import { LoginResult } from '../../../api/types/login-result';
import { PrismaService } from '../../../../../database/prisma.service';
import { TokenService } from '../../services/token.service';
import { SessionFactory } from '../../../domains/factories/session.factory';
import { SessionRepository } from '../../../infrastructure/session.repository';
import { DomainException, DomainExceptionCode } from '@app/exceptions';

export class OAuthLoginCommand {
  constructor(
    public readonly provider: 'google' | 'github',
    public readonly providerId: string,
    public readonly email: string | null, // null у GitHub если пользователь скрыл email
    public readonly displayName: string,
    public readonly meta: UserMetadata,
  ) {}
}

@CommandHandler(OAuthLoginCommand)
export class OAuthLoginUseCase implements ICommandHandler<OAuthLoginCommand, LoginResult> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly sessionFactory: SessionFactory,
    private readonly sessionRepo: SessionRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(OAuthLoginUseCase.name);
  }

  async execute({
    provider,
    providerId,
    email,
    displayName,
    meta,
  }: OAuthLoginCommand): Promise<LoginResult> {
    this.logger.log(`OAuth login attempt via ${provider}, email: ${email}`, 'execute');

    const { userId, publicId } = await this.prisma.$transaction(async (tx) => {
      // Шаг 1: ищем уже существующий OAuth аккаунт (повторный вход)
      const existingOAuth = await tx.oAuthAccount.findUnique({
        where: {
          provider_providerId: {
            provider,
            providerId,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              publicId: true,
            },
          },
        },
      });

      if (existingOAuth) {
        this.logger.log(`Existing OAuthAccount found, userId: ${existingOAuth.userId}`, 'execute');
        return {
          userId: existingOAuth.user.id,
          publicId: existingOAuth.user.publicId,
        };
      }

      // Шаг 2: ищем пользователя по email (первый вход через OAuth, но юзер уже есть)
      if (email) {
        const existingUser = await tx.user.findFirst({
          where: {
            email,
            deletedAt: null,
          },
          select: {
            id: true,
            publicId: true,
          },
        });

        if (existingUser) {
          this.logger.log(
            `Linking OAuthAccount to existing user, userId: ${existingUser.id}`,
            'execute',
          );

          await tx.oAuthAccount.create({
            data: {
              userId: existingUser.id,
              provider,
              providerId,
            },
          });

          return {
            userId: existingUser.id,
            publicId: existingUser.publicId,
          };
        }
      }

      // Шаг 3: создаём нового пользователя
      // email обязателен — GitHub пользователи со скрытым email не могут быть зарегистрированы
      if (!email) {
        throw new DomainException({
          code: DomainExceptionCode.BadRequest,
          message: 'Email is required. Please make your GitHub email public and try again.',
        });
      }

      this.logger.log(`Creating new user for ${provider} OAuth`, 'execute');

      const login = await this.generateUniqueLogin(displayName, tx);

      const newUser = await tx.user.create({
        data: {
          login,
          email,
          passwordHash: null, // OAuth пользователи не имеют пароля
          emailConfirmed: true, // email подтверждён провайдером
        },
        select: {
          id: true,
          publicId: true,
        },
      });

      await tx.oAuthAccount.create({
        data: {
          userId: newUser.id,
          provider,
          providerId,
        },
      });

      return {
        userId: newUser.id,
        publicId: newUser.publicId,
      };
    });

    // Шаг 4: создаём сессию и токены
    const deviceId = crypto.randomUUID();
    const accessToken = this.tokenService.createAccessToken(publicId, deviceId);
    const { refreshToken, payload } = this.tokenService.createRefreshToken(publicId, deviceId);
    const session = this.sessionFactory.create(userId, deviceId, payload, meta);
    await this.sessionRepo.save(session);

    this.logger.log(`OAuth login successful, userId: ${userId}`, 'execute');

    return { accessToken, refreshToken };
  }

  /* Генерирует login из displayName, добавляем счетчик если login занят */
  private async generateUniqueLogin(displayName: string, tx: any): Promise<string> {
    const base =
      displayName
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
        .slice(0, 20) || 'user';

    let login = base;
    let attempt = 0;

    while (true) {
      const exists = await tx.user.findUnique({
        where: {
          login,
        },
      });

      if (!exists) {
        return login;
      }

      attempt++;
      login = `${base}_${attempt}`;
    }
  }
}
