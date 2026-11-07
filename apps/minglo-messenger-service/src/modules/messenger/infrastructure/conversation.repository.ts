import { Injectable } from '@nestjs/common';
import { PrismaMessengerService } from '../../../database';
import { ConversationType } from '@app/messenger';

@Injectable()
export class ConversationRepository {
  constructor(private readonly prisma: PrismaMessengerService) {}

  async findDmBetweenUsers(
    user1PublicId: string,
    user2PublicId: string,
  ): Promise<{ publicId: string } | null> {
    return this.prisma.conversation.findFirst({
      select: { publicId: true },
      where: {
        type: ConversationType.DIRECT,
        AND: [
          { participants: { some: { userPublicId: user1PublicId } } },
          { participants: { some: { userPublicId: user2PublicId } } },
        ],
      },
    });
  }

  async createDm(
    initiatorPublicId: string,
    participantPublicId: string,
  ): Promise<{ publicId: string }> {
    return this.prisma.$transaction(async (tx) => {
      return tx.conversation.create({
        select: { publicId: true },
        data: {
          type: ConversationType.DIRECT,
          participants: {
            createMany: {
              data: [{ userPublicId: initiatorPublicId }, { userPublicId: participantPublicId }],
            },
          },
        },
      });
    });
  }
}
