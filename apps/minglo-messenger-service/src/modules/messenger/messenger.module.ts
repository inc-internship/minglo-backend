import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { MessengerGateway } from './api/messenger.gateway';
import { ConversationsController } from './api/conversations.controller';
import { MessagesController } from './api/messages.controller';
import { ConversationRepository } from './infrastructure/conversation.repository';
import { ConversationQueryRepository } from './infrastructure/query/conversation.query-repository';
import { MessageRepository } from './infrastructure/message.repository';
import { MessageQueryRepository } from './infrastructure/query/message.query-repository';
import { UserDataService } from './infrastructure/user-data.service';
import { GetOrCreateDmHandler } from './application/usecases/get-or-create-dm.usecase';
import { SendMessageHandler } from './application/usecases/send-message.usecase';
import { MarkReadHandler } from './application/usecases/mark-read.usecase';
import { GetConversationsHandler } from './application/queries/get-conversations.query';
import { GetConversationHandler } from './application/queries/get-conversation.query';
import { GetMessagesHandler } from './application/queries/get-messages.query';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

const commandHandlers = [GetOrCreateDmHandler, SendMessageHandler, MarkReadHandler];
const queryHandlers = [GetConversationsHandler, GetConversationHandler, GetMessagesHandler];

@Module({
  imports: [JwtModule.register({}), HttpModule],
  controllers: [ConversationsController, MessagesController],
  providers: [
    MessengerGateway,
    ConversationRepository,
    ConversationQueryRepository,
    MessageRepository,
    MessageQueryRepository,
    UserDataService,
    JwtAuthGuard,
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class MessengerModule {}
