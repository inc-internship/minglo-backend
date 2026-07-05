import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { AdminRepository } from '../../infrastructure/admin.repository';

export class AdminUnblockUserCommand {
  constructor(public readonly publicId: string) {}
}

@CommandHandler(AdminUnblockUserCommand)
export class AdminUnblockUserUseCase implements ICommandHandler<AdminUnblockUserCommand, void> {
  constructor(
    private readonly adminRepo: AdminRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(AdminUnblockUserUseCase.name);
  }

  async execute({ publicId }: AdminUnblockUserCommand): Promise<void> {
    this.logger.log(`Admin unblocking user: ${publicId}`, 'execute');

    const user = await this.adminRepo.findUserByPublicId(publicId);
    if (!user)
      throw new DomainException({ code: DomainExceptionCode.NotFound, message: 'User not found' });

    await this.adminRepo.unblockUser(publicId);
  }
}
