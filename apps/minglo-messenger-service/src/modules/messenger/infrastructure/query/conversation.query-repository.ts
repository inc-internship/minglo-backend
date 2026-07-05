import { Injectable } from '@nestjs/common';
import { PrismaMessengerService } from '../../../../database';
import { ConversationViewDto } from '../../api/view-dto/conversation.view-dto';
import { ParticipantViewDto, MessageViewDto } from '../../api/view-dto/message.view-dto';
import { UserDataService, UserProfile } from '../user-data.service';

@Injectable()
export class ConversationQueryRepository {
  constructor(
    private readonly prisma: PrismaMessengerService,
    private readonly userDataService: UserDataService,
  ) {}

  async findAllUserConversationsIdsByPublicId(userPublicId: string): Promise<string[]> {
    const conversations = await this.prisma.conversation.findMany({
      select: { publicId: true },
      where: {
        participants: { some: { userPublicId } },
      },
    });

    return conversations.map((c) => c.publicId);
  }

  async findConversationsByUserPublicId(
    userPublicId: string,
    cursor?: string,
    limit: number = 20,
  ): Promise<{ items: ConversationViewDto[]; nextCursor: string | null }> {
    const conversations = await this.prisma.conversation.findMany({
      take: limit + 1,
      ...(cursor ? { cursor: { publicId: cursor }, skip: 1 } : {}),
      where: {
        participants: { some: { userPublicId } },
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        participants: true,
        messages: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    const hasNextPage = conversations.length > limit;
    const items = hasNextPage ? conversations.slice(0, limit) : conversations;
    const nextCursor = hasNextPage ? items[items.length - 1].publicId : null;

    const allUserIds = items.flatMap((c) => [
      ...c.participants.map((p: any) => p.userPublicId),
      ...(c.messages[0] ? [c.messages[0].senderPublicId] : []),
    ]);
    const profileMap = await this.userDataService.getUserProfiles(allUserIds);

    return {
      items: items.map((c) => this.mapToViewDto(c, userPublicId, profileMap)),
      nextCursor,
    };
  }

  async findConversationByPublicId(
    conversationPublicId: string,
    userPublicId: string,
  ): Promise<ConversationViewDto | null> {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        publicId: conversationPublicId,
        participants: { some: { userPublicId } },
      },
      include: {
        participants: true,
        messages: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!conversation) return null;

    const allUserIds = [
      ...conversation.participants.map((p: any) => p.userPublicId),
      ...(conversation.messages[0] ? [conversation.messages[0].senderPublicId] : []),
    ];
    const profileMap = await this.userDataService.getUserProfiles(allUserIds);

    return this.mapToViewDto(conversation, userPublicId, profileMap);
  }

  private mapToViewDto(
    conversation: any,
    currentUserPublicId: string,
    profileMap: Map<string, UserProfile>,
  ): ConversationViewDto {
    const currentParticipant = conversation.participants.find(
      (p: any) => p.userPublicId === currentUserPublicId,
    );

    const participants: ParticipantViewDto[] = conversation.participants.map((p: any) => {
      const profile = profileMap.get(p.userPublicId);
      return {
        id: p.userPublicId,
        login: profile?.login ?? null,
        avatarUrl: profile?.avatarUrl ?? null,
      };
    });

    const lastMsg = conversation.messages[0] ?? null;
    const senderProfile = lastMsg ? profileMap.get(lastMsg.senderPublicId) : null;
    const lastMessage: MessageViewDto | null = lastMsg
      ? {
          id: lastMsg.publicId,
          text: lastMsg.text,
          type: lastMsg.type,
          sender: {
            id: lastMsg.senderPublicId,
            login: senderProfile?.login ?? null,
            avatarUrl: senderProfile?.avatarUrl ?? null,
          },
          createdAt: lastMsg.createdAt.toISOString(),
        }
      : null;

    return {
      id: conversation.publicId,
      type: conversation.type,
      participants,
      lastMessage,
      unreadCount: currentParticipant?.unreadCount ?? 0,
      updatedAt: conversation.updatedAt.toISOString(),
    };
  }
}