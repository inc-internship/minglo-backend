import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ConversationQueryRepository } from '../../infrastructure/query/conversation.query-repository';
import { ConversationsWithCursorViewDto } from '../../api/view-dto/conversations-with-cursor.view-dto';

export class GetConversationsQuery {
  constructor(
    public readonly userPublicId: string,
    public readonly cursor?: string,
    public readonly limit: number = 20,
  ) {}
}

@QueryHandler(GetConversationsQuery)
export class GetConversationsHandler implements IQueryHandler<GetConversationsQuery> {
  constructor(private readonly conversationQueryRepo: ConversationQueryRepository) {}

  async execute(query: GetConversationsQuery): Promise<ConversationsWithCursorViewDto> {
    return this.conversationQueryRepo.findConversationsByUserPublicId(
      query.userPublicId,
      query.cursor,
      query.limit,
    );
  }
}
