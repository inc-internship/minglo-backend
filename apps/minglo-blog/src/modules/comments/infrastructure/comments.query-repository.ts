import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CommentViewDto, CommentsWithCursorViewDto } from '../api/view-dto';
import { CommentWithAuthor } from '../../../../prisma/types';

const COMMENT_INCLUDE = {
  author: { include: { profile: { include: { avatar: { where: { deletedAt: null } } } } } },
  likes: { where: { user: { blockedAt: null } } },
  _count: {
    select: { likes: { where: { user: { blockedAt: null } } } },
  },
} as const;

@Injectable()
export class CommentsQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPostComments(
    postPublicId: string,
    currentUserId: number,
    cursor?: string,
    limit: number = 10,
  ): Promise<CommentsWithCursorViewDto> {
    // Own comments first, then the rest ordered by createdAt DESC
    const [ownComments, otherComments] = await Promise.all([
      this.prisma.comment.findMany({
        where: {
          post: { publicId: postPublicId },
          authorId: currentUserId,
          parentCommentId: null,
          deletedAt: null,
          author: { blockedAt: null },
        },
        include: COMMENT_INCLUDE,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.comment.findMany({
        where: {
          post: { publicId: postPublicId },
          authorId: { not: currentUserId },
          parentCommentId: null,
          deletedAt: null,
          author: { blockedAt: null },
        },
        include: COMMENT_INCLUDE,
        orderBy: { createdAt: 'desc' },
        take: limit + 1,
        ...(cursor && { skip: 1, cursor: { publicId: cursor } }),
      }),
    ]);

    const hasNextPage = otherComments.length > limit;
    const otherItems = hasNextPage ? otherComments.slice(0, limit) : otherComments;
    const nextCursor = hasNextPage ? otherItems[otherItems.length - 1].publicId : null;

    const allItems = [...ownComments, ...otherItems];

    return {
      items: allItems.map((c) => this.toView(c, currentUserId)),
      nextCursor,
      hasNextPage,
    };
  }

  async findCommentReplies(
    commentPublicId: string,
    currentUserId: number,
    cursor?: string,
    limit: number = 10,
  ): Promise<CommentsWithCursorViewDto> {
    const parentComment = await this.prisma.comment.findUnique({
      where: { publicId: commentPublicId },
      select: { id: true },
    });

    const replies = await this.prisma.comment.findMany({
      where: {
        parentCommentId: parentComment?.id,
        deletedAt: null,
        author: { blockedAt: null },
      },
      include: COMMENT_INCLUDE,
      orderBy: { createdAt: 'asc' },
      take: limit + 1,
      ...(cursor && { skip: 1, cursor: { publicId: cursor } }),
    });

    const hasNextPage = replies.length > limit;
    const items = hasNextPage ? replies.slice(0, limit) : replies;
    const nextCursor = hasNextPage ? items[items.length - 1].publicId : null;

    return {
      items: items.map((c) => this.toView(c, currentUserId)),
      nextCursor,
      hasNextPage,
    };
  }

  private toView(comment: CommentWithAuthor, currentUserId: number): CommentViewDto {
    return {
      id: comment.publicId,
      text: comment.text,
      author: {
        id: comment.author.publicId,
        login: comment.author.login,
        avatarUrl: comment.author.profile?.avatar?.urlThumbnail ?? null,
      },
      likesCount: comment._count.likes,
      repliesCount: comment.repliesCount,
      isLiked: comment.likes.some((l) => l.userId === currentUserId),
      isOwn: comment.authorId === currentUserId,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
    };
  }
}
