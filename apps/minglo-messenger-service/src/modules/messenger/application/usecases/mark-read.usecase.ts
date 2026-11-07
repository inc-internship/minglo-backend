import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { MessageRepository } from '../../infrastructure/message.repository';

export class MarkReadCommand {
  constructor(
    public readonly userPublicId: string,
    public readonly conversationPublicId: string,
  ) {}
}

@CommandHandler(MarkReadCommand)
export class MarkReadHandler implements ICommandHandler<MarkReadCommand> {
  constructor(private readonly messageRepo: MessageRepository) {}

  async execute(command: MarkReadCommand): Promise<void> {
    const updated = await this.messageRepo.markRead(
      command.conversationPublicId,
      command.userPublicId,
    );

    if (!updated) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Conversation not found or access denied',
      });
    }
  }
}
