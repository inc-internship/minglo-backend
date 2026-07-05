import { Injectable } from '@nestjs/common';
import { PrismaMessengerService } from '../../../database';
import { MessageType } from '@app/messenger';

@Injectable()
export class MessageRepository {
  constructor(private readonly prisma: PrismaMessengerService) {}

  async findParticipant(
    conversationPublicId: string,
    userPublicId: string,
  ): Promise<{ conversationId: number } | null> {
    const conversation = await this.prisma.conversation.findFirst({
      select: { id: true },
      where: { publicId: conversationPublicId },
    });
    if (!conversation) return null;

    const participant = await this.prisma.conversationParticipant.findFirst({
      select: { conversationId: true },
      where: { conversationId: conversation.id, userPublicId },
    });
    return participant;
  }

  async createMessage(
    conversationPublicId: string,
    conversationId: number,
    senderPublicId: string,
    text: string,
  ): Promise<{ publicId: string; text: string | null; type: string; createdAt: Date }> {
    return this.prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        select: { publicId: true, text: true, type: true, createdAt: true },
        data: {
          conversationId,
          senderPublicId,
          text,
          type: MessageType.TEXT,
        },
      });

      await tx.conversation.update({
        where: { publicId: conversationPublicId },
        data: { updatedAt: new Date() },
      });

      await tx.conversationParticipant.updateMany({
        where: { conversationId, NOT: { userPublicId: senderPublicId } },
        data: { unreadCount: { increment: 1 } },
      });

      return message;
    });
  }

  async markRead(conversationPublicId: string, userPublicId: string): Promise<boolean> {
    const conversation = await this.prisma.conversation.findFirst({
      select: { id: true },
      where: { publicId: conversationPublicId },
    });
    if (!conversation) return false;

    const result = await this.prisma.conversationParticipant.updateMany({
      where: { conversationId: conversation.id, userPublicId },
      data: { unreadCount: 0, lastReadAt: new Date() },
    });

    return result.count > 0;
  }
}