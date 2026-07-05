import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { ConversationRepository } from '../../infrastructure/conversation.repository';
import { MessengerGateway } from '../../api/messenger.gateway';

export class GetOrCreateDmCommand {
  constructor(
    public readonly initiatorPublicId: string,
    public readonly participantPublicId: string,
  ) {}
}

@CommandHandler(GetOrCreateDmCommand)
export class GetOrCreateDmHandler implements ICommandHandler<GetOrCreateDmCommand> {
  constructor(
    private readonly conversationRepo: ConversationRepository,
    private readonly gateway: MessengerGateway,
  ) {}

  async execute(command: GetOrCreateDmCommand): Promise<{ conversationPublicId: string }> {
    const { initiatorPublicId, participantPublicId } = command;

    if (initiatorPublicId === participantPublicId) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Cannot create conversation with yourself',
      });
    }

    const existing = await this.conversationRepo.findDmBetweenUsers(
      initiatorPublicId,
      participantPublicId,
    );

    if (existing) {
      return { conversationPublicId: existing.publicId };
    }

    const conversation = await this.conversationRepo.createDm(
      initiatorPublicId,
      participantPublicId,
    );

    this.gateway.joinUserToConversation(initiatorPublicId, conversation.publicId);
    this.gateway.joinUserToConversation(participantPublicId, conversation.publicId);

    return { conversationPublicId: conversation.publicId };
  }
}
