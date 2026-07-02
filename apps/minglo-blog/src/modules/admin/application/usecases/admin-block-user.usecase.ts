import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { AdminRepository } from '../../infrastructure/admin.repository';

export class AdminBlockUserCommand {
  constructor(public readonly publicId: string) {}
}

@CommandHandler(AdminBlockUserCommand)
export class AdminBlockUserUseCase implements ICommandHandler<AdminBlockUserCommand, void> {
  constructor(
    private readonly adminRepo: AdminRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(AdminBlockUserUseCase.name);
  }

  async execute({ publicId }: AdminBlockUserCommand): Promise<void> {
    this.logger.log(`Admin blocking user: ${publicId}`, 'execute');
    const user = await this.adminRepo.findUserByPublicId(publicId);
    if (!user)
      throw new DomainException({ code: DomainExceptionCode.NotFound, message: 'User not found' });

    await this.adminRepo.blockUser(publicId);
  }
}
