import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { MessengerGateway } from './api/messenger.gateway';
import { ConversationsController } from './api/conversations.controller';
import { ConversationRepository } from './infrastructure/conversation.repository';
import { ConversationQueryRepository } from './infrastructure/query/conversation.query-repository';
import { UserDataService } from './infrastructure/user-data.service';
import { GetOrCreateDmHandler } from './application/usecases/get-or-create-dm.usecase';
import { GetConversationsHandler } from './application/queries/get-conversations.query';
import { GetConversationHandler } from './application/queries/get-conversation.query';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

const commandHandlers = [GetOrCreateDmHandler];
const queryHandlers = [GetConversationsHandler, GetConversationHandler];

@Module({
  imports: [JwtModule, HttpModule],
  controllers: [ConversationsController],
  providers: [
    MessengerGateway,
    ConversationRepository,
    ConversationQueryRepository,
    UserDataService,
    JwtAuthGuard,
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class MessengerModule {}