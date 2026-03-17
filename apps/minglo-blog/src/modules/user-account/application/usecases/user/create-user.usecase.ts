import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserInputDto } from '../../../api/input-dto';
import { UserService } from '../../services';
import { UserFactory } from '../../../domains';
import { UserRepository } from '../../../infrastructure';
import { UserRegisteredEvent } from '../../events';

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
    private eventBus: EventBus,
  ) {}

  async execute({ dto }: CreateUserCommand): Promise<string> {
    const { login, email, password, redirectUrl, forSA = false } = dto;

    await this.userService.ensureUserCredentialsAreUnique(login, email);

    const user = await this.userFactory.create({ login, email, password, forSA });

    const publicId = await this.userRepo.create(user);

    if (!forSA) {
      // отправляем письмо на почту если это не SA
      const code = user.emailConfirmation.code;
      this.eventBus.publish(new UserRegisteredEvent({ email, code, redirectUrl }));
    }

    return publicId;
  }
}
