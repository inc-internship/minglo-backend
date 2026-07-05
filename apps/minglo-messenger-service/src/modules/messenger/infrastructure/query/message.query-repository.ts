import { Injectable } from '@nestjs/common';
import { PrismaMessengerService } from '../../../../database';
import { MessageViewDto } from '../../api/view-dto/message.view-dto';
import { MessagesWithCursorViewDto } from '../../api/view-dto/messages-with-cursor.view-dto';
import { UserDataService } from '../user-data.service';

@Injectable()
export class MessageQueryRepository {
  constructor(
    private readonly prisma: PrismaMessengerService,
    private readonly userDataService: UserDataService,
  ) {}

  async findMessagesByConversation(
    conversationPublicId: string,
    userPublicId: string,
    cursor?: string,
    limit: number = 20,
  ): Promise<MessagesWithCursorViewDto | null> {
    const conversation = await this.prisma.conversation.findFirst({
      select: { id: true },
      where: {
        publicId: conversationPublicId,
        participants: { some: { userPublicId } },
      },
    });

    if (!conversation) return null;

    const messages = await this.prisma.message.findMany({
      take: limit + 1,
      ...(cursor ? { cursor: { publicId: cursor }, skip: 1 } : {}),
      where: { conversationId: conversation.id, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: {
        publicId: true,
        text: true,
        type: true,
        senderPublicId: true,
        createdAt: true,
      },
    });

    const hasNextPage = messages.length > limit;
    const items = hasNextPage ? messages.slice(0, limit) : messages;
    const nextCursor = hasNextPage ? items[items.length - 1].publicId : null;

    const senderIds = items.map((m) => m.senderPublicId);
    const profileMap = await this.userDataService.getUserProfiles(senderIds);

    return {
      items: items.map((m) => {
        const profile = profileMap.get(m.senderPublicId);
        return {
          id: m.publicId,
          conversationId: conversationPublicId,
          text: m.text,
          type: m.type,
          sender: {
            id: m.senderPublicId,
            login: profile?.login ?? null,
            avatarUrl: profile?.avatarUrl ?? null,
          },
          createdAt: m.createdAt.toISOString(),
        } satisfies MessageViewDto;
      }),
      nextCursor,
    };
  }
}