import { Injectable } from '@nestjs/common';
import { PrismaMessengerService } from '../../../../database';

@Injectable()
export class ConversationQueryRepository {
  constructor(private readonly prisma: PrismaMessengerService) {}

  async findAllUserConversationsIdsByPublicId(userPublicId: string): Promise<string[]> {
    const conversations = await this.prisma.conversation.findMany({
      select: {
        publicId: true,
      },
      where: {
        participants: {
          some: {
            userPublicId,
          },
        },
      },
    });

    return conversations.map((c) => c.publicId);
  }
}
