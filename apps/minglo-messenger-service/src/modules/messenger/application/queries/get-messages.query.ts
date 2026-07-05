import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { MessageQueryRepository } from '../../infrastructure/query/message.query-repository';
import { MessagesWithCursorViewDto } from '../../api/view-dto/messages-with-cursor.view-dto';

export class GetMessagesQuery {
  constructor(
    public readonly userPublicId: string,
    public readonly conversationPublicId: string,
    public readonly cursor?: string,
    public readonly limit: number = 20,
  ) {}
}

@QueryHandler(GetMessagesQuery)
export class GetMessagesHandler implements IQueryHandler<GetMessagesQuery> {
  constructor(private readonly messageQueryRepo: MessageQueryRepository) {}

  async execute(query: GetMessagesQuery): Promise<MessagesWithCursorViewDto> {
    const result = await this.messageQueryRepo.findMessagesByConversation(
      query.conversationPublicId,
      query.userPublicId,
      query.cursor,
      query.limit,
    );

    if (!result) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Conversation not found or access denied',
      });
    }

    return result;
  }
}