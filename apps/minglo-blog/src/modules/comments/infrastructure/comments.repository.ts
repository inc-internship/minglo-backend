import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CommentEntity } from '../domains/entities/comment.entity';

@Injectable()
export class CommentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(comment: CommentEntity): Promise<string> {
    const result = await this.prisma.comment.create({
      data: {
        postId: comment.getPostId(),
        authorId: comment.getAuthorId(),
        text: comment.getText(),
        parentCommentId: comment.getParentCommentId(),
      },
    });
    return result.publicId;
  }

  async findByPublicId(publicId: string) {
    return this.prisma.comment.findUnique({
      where: { publicId, deletedAt: null },
    });
  }

  async softDelete(id: number): Promise<void> {
    await this.prisma.comment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async incrementRepliesCount(parentCommentId: number): Promise<void> {
    await this.prisma.comment.update({
      where: { id: parentCommentId },
      data: { repliesCount: { increment: 1 } },
    });
  }
}