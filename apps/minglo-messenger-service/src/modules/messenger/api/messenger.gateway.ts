import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Namespace, Socket } from 'socket.io';
import { LoggerService } from '@app/logger';
import { MessengerConfig } from '../../../core/messenger.config';
import { ConversationQueryRepository } from '../infrastructure/query/conversation.query-repository';
import { MessageViewDto } from './view-dto/message.view-dto';
import { WS_CLIENT_EVENTS, WS_SERVER_EVENTS } from '../shared';
import { SendMessageCommand } from '../application/usecases/send-message.usecase';

@WebSocketGateway({ namespace: '/messenger' })
@Injectable()
export class MessengerGateway implements OnGatewayConnection {
  @WebSocketServer() server: Namespace;

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: MessengerConfig,
    private readonly conversationQueryRepo: ConversationQueryRepository,
    private readonly commandBus: CommandBus,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(MessengerGateway.name);
  }

  async handleConnection(client: Socket): Promise<void> {
    const rawToken =
      (client.handshake.auth?.token as string | undefined) ??
      client.handshake.headers?.authorization;
    const token = rawToken?.replace('Bearer ', '');

    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify<{ publicId: string }>(token, {
        secret: this.config.accessSecret,
      });

      client.data.userPublicId = payload.publicId;

      // персональная комната — нужна для joinUserToConversation()
      void client.join(`user:${payload.publicId}`);

      // connect user to conversations
      const conversationIds =
        await this.conversationQueryRepo.findAllUserConversationsIdsByPublicId(payload.publicId);

      for (const convId of conversationIds) {
        void client.join(`conversation:${convId}`);
      }

      this.logger.log(`Connected: userId=${payload.publicId}, socketId=${client.id}`);
    } catch {
      this.logger.warn(`Rejected: invalid token, socketId=${client.id}`);
      client.disconnect();
    }
  }

  emitMessage(conversationPublicId: string, message: MessageViewDto): void {
    this.server
      .to(`conversation:${conversationPublicId}`)
      .emit(WS_SERVER_EVENTS.MESSAGE_RECEIVED, message);
  }

  joinUserToConversation(userPublicId: string, conversationPublicId: string): void {
    this.server.in(`user:${userPublicId}`).socketsJoin(`conversation:${conversationPublicId}`);
  }

  // Messages
  @SubscribeMessage(WS_CLIENT_EVENTS.MESSAGE_SEND)
  async handleSendMessage(
    client: Socket,
    payload: { conversationId: string; text: string },
  ): Promise<void> {
    const userPublicId = client.data.userPublicId as string | undefined;
    if (!userPublicId) {
      client.emit('ERROR', { message: 'Unauthorized' });
      return;
    }

    if (!payload?.text?.trim()) {
      client.emit('ERROR', { message: 'Message text is required' });
      return;
    }

    try {
      await this.commandBus.execute(
        new SendMessageCommand(userPublicId, payload.conversationId, payload.text),
      );
    } catch (err) {
      client.emit('ERROR', { message: err?.message ?? 'Failed to send message' });
    }
  }

  // Typing indicators
  @SubscribeMessage(WS_CLIENT_EVENTS.TYPING_START)
  handleTypingStart(client: Socket, payload: { conversationId: string }): void {
    const userPublicId = client.data.userPublicId as string | undefined;
    if (!userPublicId || !payload?.conversationId) return;

    client.to(`conversation:${payload.conversationId}`).emit(WS_SERVER_EVENTS.USER_TYPING, {
      userPublicId,
      conversationId: payload.conversationId,
      isTyping: true,
    });
  }

  @SubscribeMessage(WS_CLIENT_EVENTS.TYPING_STOP)
  handleTypingStop(client: Socket, payload: { conversationId: string }): void {
    const userPublicId = client.data.userPublicId as string | undefined;
    if (!userPublicId || !payload?.conversationId) return;

    client.to(`conversation:${payload.conversationId}`).emit(WS_SERVER_EVENTS.USER_TYPING, {
      userPublicId,
      conversationId: payload.conversationId,
      isTyping: false,
    });
  }
}
