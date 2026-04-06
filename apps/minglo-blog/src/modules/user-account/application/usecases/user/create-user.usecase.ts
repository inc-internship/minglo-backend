import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserInputDto } from '../../../api/input-dto';
import { UserService } from '../../services';
import { UserFactory } from '../../../domains';
import { UserRepository } from '../../../infrastructure';
import { UserRegisteredEvent } from '../../events';
import { LoggerService } from '@app/logger';

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
    private logger: LoggerService,
  ) {
    this.logger.setContext(CreateUserUseCase.name);
  }

  async execute({ dto }: CreateUserCommand): Promise<string> {
    const { login, email, password, redirectUrl, forSA = false } = dto;

    await this.userService.ensureUserCredentialsAreUnique(login, email);
    this.logger.log(`Check for User unique credentials, completed: successful`, 'execute');

    const user = await this.userFactory.create({ login, email, password, forSA });

    const publicId = await this.userRepo.create(user);
    this.logger.log(`User saved to DB, publicId: ${publicId}`, 'execute');

    if (!forSA) {
      // отправляем письмо на почту если это не SA
      const code = user.emailConfirmation.code;
      this.eventBus.publish(new UserRegisteredEvent({ email, code, redirectUrl }));
      this.logger.log('UserRegisteredEvent published', 'execute');
    }

    return publicId;
  }
}
