import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { AdminRepository } from '../../infrastructure/admin.repository';
import { BlockUserInput } from '../../api/input-dto/block-user.input';
import { AdminBanReason } from '../../api/enums/admin-ban-reason.enum';

export class AdminBlockUserCommand {
  constructor(public readonly input: BlockUserInput) {}
}

@CommandHandler(AdminBlockUserCommand)
export class AdminBlockUserUseCase implements ICommandHandler<AdminBlockUserCommand, void> {
  constructor(
    private readonly adminRepo: AdminRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(AdminBlockUserUseCase.name);
  }

  async execute({ input }: AdminBlockUserCommand): Promise<void> {
    this.logger.log(`Admin blocking user: ${input.publicId}`, 'execute');
    const blockReason =
      input.reason === AdminBanReason.ANOTHER_REASON ? input.customReason : input.reason;
    const user = await this.adminRepo.findUserByPublicId(input.publicId);
    if (!user)
      throw new DomainException({ code: DomainExceptionCode.NotFound, message: 'User not found' });

    await this.adminRepo.blockUser(input.publicId, blockReason);
  }
}
