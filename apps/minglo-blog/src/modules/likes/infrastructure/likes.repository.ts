import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { Prisma } from '../../../../prisma/generated/prisma/client';

@Injectable()
export class LikesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async likePost(postId: number, userId: number): Promise<void> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId, deletedAt: null },
      select: { id: true },
    });

    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
        extensions: [{ field: 'postId', message: 'Post not found' }],
      });
    }

    try {
      await this.prisma.$transaction([
        this.prisma.postLike.create({ data: { postId, userId } }),
        this.prisma.post.update({ where: { id: postId }, data: { likesCount: { increment: 1 } } }),
      ]);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new DomainException({
          code: DomainExceptionCode.Conflict,
          message: 'Already liked this post',
          extensions: [{ field: 'postId', message: 'Already liked this post' }],
        });
      }
      throw e;
    }
  }

  async unlikePost(postId: number, userId: number): Promise<void> {
    const like = await this.prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (!like) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Like not found',
        extensions: [{ field: 'postId', message: 'You have not liked this post' }],
      });
    }

    await this.prisma.$transaction([
      this.prisma.postLike.delete({ where: { postId_userId: { postId, userId } } }),
      this.prisma.post.update({ where: { id: postId }, data: { likesCount: { decrement: 1 } } }),
    ]);
  }

  async likeComment(commentId: number, userId: number): Promise<void> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId, deletedAt: null },
      select: { id: true },
    });

    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found',
        extensions: [{ field: 'commentId', message: 'Comment not found' }],
      });
    }

    try {
      await this.prisma.$transaction([
        this.prisma.commentLike.create({ data: { commentId, userId } }),
        this.prisma.comment.update({
          where: { id: commentId },
          data: { likesCount: { increment: 1 } },
        }),
      ]);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new DomainException({
          code: DomainExceptionCode.Conflict,
          message: 'Already liked this comment',
          extensions: [{ field: 'commentId', message: 'Already liked this comment' }],
        });
      }
      throw e;
    }
  }

  async unlikeComment(commentId: number, userId: number): Promise<void> {
    const like = await this.prisma.commentLike.findUnique({
      where: { commentId_userId: { commentId, userId } },
    });

    if (!like) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Like not found',
        extensions: [{ field: 'commentId', message: 'You have not liked this comment' }],
      });
    }

    await this.prisma.$transaction([
      this.prisma.commentLike.delete({ where: { commentId_userId: { commentId, userId } } }),
      this.prisma.comment.update({
        where: { id: commentId },
        data: { likesCount: { decrement: 1 } },
      }),
    ]);
  }
}
