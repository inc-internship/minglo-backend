import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../../../infrastructure/user.repository';
import { LoginUserInputDto } from '../../../api/input-dto/login-user.input.dto';
import { User } from '../../../../../../prisma/generated/prisma/client';
import { CryptoService } from '../../services/crypto.service';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { JwtService } from '../../services/jwt.service';
import { LoginResult } from '../../../api/types/login-result';

export class LoginUserCommand {
  constructor(public readonly dto: LoginUserInputDto) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand, LoginResult> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cryptoService: CryptoService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: LoginUserCommand): Promise<LoginResult> {
    const { dto } = command;

    const user: User = await this.userRepository.getByEmail(dto.email);

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

    return {
      refreshToken: this.jwtService.createRefreshToken(user.publicId),
      accessToken: this.jwtService.createAccessToken(user.publicId),
    };
  }
}
