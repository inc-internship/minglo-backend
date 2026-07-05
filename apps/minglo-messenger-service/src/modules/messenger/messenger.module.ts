import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MessengerGateway } from './api/messenger.gateway';
import { ConversationQueryRepository } from './infrastructure/query/conversation.query-repository';

@Module({
  imports: [JwtModule],
  controllers: [],
  providers: [MessengerGateway, ConversationQueryRepository],
})
export class MessengerModule {}
