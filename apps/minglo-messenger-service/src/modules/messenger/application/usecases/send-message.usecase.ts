import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { MessageRepository } from '../../infrastructure/message.repository';
import { UserDataService } from '../../infrastructure/user-data.service';
import { MessengerGateway } from '../../api/messenger.gateway';
import { MessageViewDto } from '../../api/view-dto/message.view-dto';
import { MessageType } from '@app/messenger';

export class SendMessageCommand {
  constructor(
    public readonly userPublicId: string,
    public readonly conversationPublicId: string,
    public readonly text: string,
  ) {}
}

@CommandHandler(SendMessageCommand)
export class SendMessageHandler implements ICommandHandler<SendMessageCommand> {
  constructor(
    private readonly messageRepo: MessageRepository,
    private readonly userDataService: UserDataService,
    private readonly gateway: MessengerGateway,
  ) {}

  async execute(command: SendMessageCommand): Promise<void> {
    const { userPublicId, conversationPublicId, text } = command;

    const trimmedText = text.trim();
    if (!trimmedText) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Message text cannot be empty',
      });
    }

    const participant = await this.messageRepo.findParticipant(conversationPublicId, userPublicId);
    if (!participant) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Not a participant of this conversation',
      });
    }

    const message = await this.messageRepo.createMessage(
      conversationPublicId,
      participant.conversationId,
      userPublicId,
      trimmedText,
    );

    const senderProfile = await this.userDataService.getUserProfile(userPublicId);

    const messageViewDto: MessageViewDto = {
      id: message.publicId,
      conversationId: conversationPublicId,
      text: message.text,
      type: message.type as MessageType,
      sender: {
        id: userPublicId,
        login: senderProfile.login,
        avatarUrl: senderProfile.avatarUrl,
      },
      createdAt: message.createdAt.toISOString(),
    };

    this.gateway.emitMessage(conversationPublicId, messageViewDto);

    // TODO: Publish RabbitMQ event MESSENGER_EVENTS.MESSAGE_SENT → minglo-blog (Commit 6 RMQ)
  }
}
