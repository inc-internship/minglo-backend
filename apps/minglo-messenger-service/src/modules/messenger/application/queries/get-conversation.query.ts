import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { ConversationQueryRepository } from '../../infrastructure/query/conversation.query-repository';
import { ConversationViewDto } from '../../api/view-dto/conversation.view-dto';

export class GetConversationQuery {
  constructor(
    public readonly userPublicId: string,
    public readonly conversationPublicId: string,
  ) {}
}

@QueryHandler(GetConversationQuery)
export class GetConversationHandler implements IQueryHandler<GetConversationQuery> {
  constructor(private readonly conversationQueryRepo: ConversationQueryRepository) {}

  async execute(query: GetConversationQuery): Promise<ConversationViewDto> {
    const conversation = await this.conversationQueryRepo.findConversationByPublicId(
      query.conversationPublicId,
      query.userPublicId,
    );

    if (!conversation) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Conversation not found or access denied',
      });
    }

    return conversation;
  }
}
