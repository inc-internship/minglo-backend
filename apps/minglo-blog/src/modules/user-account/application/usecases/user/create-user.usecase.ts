import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserInputDto } from '../../../api/input-dto';
import { UserService } from '../../services/user.service';
import { UserFactory } from '../../../domains';
import { UserRepository } from '../../../infrastructure/user.repository';
import { UserRegisteredEvent } from '../../events/user-registered.handler';

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

    const userEntity = await this.userFactory.create({ login, email, password, forSA });

    const publicId = await this.userRepo.create(userEntity);

    if (!forSA) {
      // отправляем письмо на почту если это не SA
      this.eventBus.publish(
        new UserRegisteredEvent(email, redirectUrl, userEntity.emailConfirmation.code),
      );
    }

    return publicId;
  }
}
