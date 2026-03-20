import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginUserInputDto } from '../../../api/input-dto/login-user.input.dto';
import { User } from '../../../../../../prisma/generated/prisma/client';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { TokenService } from '../../services/token.service';
import { LoginResult } from '../../../api/types/login-result';
import { CryptoService } from '../../services';
import { UserRepository } from '../../../infrastructure';
import { SessionFactory } from '../../../domains/factories/session.factory';
import { SessionRepository } from '../../../infrastructure/session.repository';
import { SessionEntity } from '../../../domains/entities/session.entity';
import { UserMetadata } from '../../../../../core/decorators/auth/user-agent.decorator';

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
  ) {}

  async execute(command: LoginUserCommand): Promise<LoginResult> {
    const { dto, meta } = command;

    const user: User = await this.userRepository.getByEmail(dto.email);
    if (!user.emailConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid email or password',
      });
    }

    const isPasswordValid: boolean = await this.cryptoService.comparePassword({
      password: dto.password,
      passwordHash: user.passwordHash,
    });
    if (!isPasswordValid) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid email or password',
      });
    }

    const deviceId: string = crypto.randomUUID();

    const accessToken: string = this.tokenService.createAccessToken(user.publicId, deviceId);
    const { refreshToken, payload } = this.tokenService.createRefreshToken(user.publicId, deviceId);

    const session: SessionEntity = this.sessionFactory.create(user.id, deviceId, payload, meta);
    await this.sessionRepository.save(session);

    return {
      refreshToken: refreshToken,
      accessToken: accessToken,
    };
  }
}
