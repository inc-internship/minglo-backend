import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';
import { Namespace, Socket } from 'socket.io';
import { LoggerService } from '@app/logger';
import { MessengerConfig } from '../../../core/messenger.config';
import { ConversationQueryRepository } from '../infrastructure/query/conversation.query-repository';
import { MessageViewDto } from './view-dto/message.view-dto';
import { WS_SERVER_EVENTS } from '../shared';

@WebSocketGateway({ namespace: '/messenger' })
@Injectable()
export class MessengerGateway implements OnGatewayConnection {
  @WebSocketServer() server: Namespace;

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: MessengerConfig,
    private readonly conversationQueryRepo: ConversationQueryRepository,
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
}
