import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginUserInputDto } from '../../../api/input-dto';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { TokenService } from '../../services/token.service';
import { LoginResult } from '../../../api/types/login-result';
import { CryptoService } from '../../services';
import { UserRepository } from '../../../infrastructure';
import { SessionFactory } from '../../../domains/factories/session.factory';
import { SessionRepository } from '../../../infrastructure/session.repository';
import { UserMetadata } from '../../../../../core/decorators/auth/user-agent.decorator';
import { LoggerService } from '@app/logger';

export class LoginUserCommand {
  constructor(
    public readonly dto: LoginUserInputDto,
    public readonly meta: UserMetadata,
  ) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand, LoginResult> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cryptoService: CryptoService,
    private readonly tokenService: TokenService,
    private readonly sessionFactory: SessionFactory,
    private readonly sessionRepository: SessionRepository,
    private logger: LoggerService,
  ) {}

  async execute({ dto, meta }: LoginUserCommand): Promise<LoginResult> {
    const { email, password } = dto;

    this.logger.log(`Attempt to login into the app, user email: ${email}`, 'execute');

    const user = await this.userRepository.findByEmail(email);

    if (!user || !user.emailConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid email or password',
      });
    }

    const isPasswordValid = await this.cryptoService.comparePassword({
      password,
      passwordHash: user.passwordHash,
    });

    if (!isPasswordValid) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid email or password',
      });
    }

    const deviceId = crypto.randomUUID();

    const accessToken = this.tokenService.createAccessToken(user.publicId, deviceId);

    const { refreshToken, payload } = this.tokenService.createRefreshToken(user.publicId, deviceId);

    const session = this.sessionFactory.create(user.id, deviceId, payload, meta);

    await this.sessionRepository.save(session);

    return {
      refreshToken: refreshToken,
      accessToken: accessToken,
    };
  }
}
