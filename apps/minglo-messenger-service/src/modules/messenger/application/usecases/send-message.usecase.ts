import { forwardRef, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import {
  MESSENGER_EVENTS,
  MESSENGER_RMQ_CLIENT,
  MessageSentPayload,
  MessageType,
} from '@app/messenger';
import { MessageRepository } from '../../infrastructure/message.repository';
import { UserDataService } from '../../infrastructure/user-data.service';
import { MessengerGateway } from '../../api/messenger.gateway';
import { MessageViewDto } from '../../api/view-dto/message.view-dto';

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
    @Inject(forwardRef(() => MessengerGateway))
    private readonly gateway: MessengerGateway,
    @Inject(MESSENGER_RMQ_CLIENT)
    private readonly rmqClient: ClientProxy,
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

    const [senderProfile, recipientPublicIds] = await Promise.all([
      this.userDataService.getUserProfile(userPublicId),
      this.messageRepo.findOtherParticipantIds(participant.conversationId, userPublicId),
    ]);

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

    if (recipientPublicIds.length > 0) {
      const payload: MessageSentPayload = {
        conversationId: conversationPublicId,
        messageId: message.publicId,
        senderPublicId: userPublicId,
        senderLogin: senderProfile.login,
        recipientPublicIds,
        text: message.text,
        createdAt: message.createdAt.toISOString(),
      };
      this.rmqClient.emit(MESSENGER_EVENTS.MESSAGE_SENT, payload).subscribe();
    }
  }
}
