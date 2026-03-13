import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserInputDto } from '../../../api/input-dto';
import { UserService } from '../../services/user.service';
import { UserFactory } from '../../../domains';
import { UserRepository } from '../../../infrastructure/user.repository';

export class CreateUserCommand {
  constructor(public dto: CreateUserInputDto & { forSA?: boolean }) {}
}

/**
 * Создает пользователя в системе.
 * Для SA создает пользователя с автоподтверждением.
 */
@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand, string> {
  constructor(
    private userService: UserService,
    private userFactory: UserFactory,
    private userRepo: UserRepository,
  ) {}

  async execute({ dto }: CreateUserCommand): Promise<string> {
    const { login, email, password, forSA = false } = dto;

    await this.userService.ensureUserCredentialsAreUnique(login, email);

    const userEntity = await this.userFactory.create({ login, email, password, forSA });

    return this.userRepo.create(userEntity);
  }
}
