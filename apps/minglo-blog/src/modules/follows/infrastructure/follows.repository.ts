import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { Prisma } from '../../../../prisma/generated/prisma/client';

@Injectable()
export class FollowsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(followerId: number, followingId: number): Promise<void> {
    try {
      await this.prisma.$transaction([
        this.prisma.follow.create({ data: { followerId, followingId } }),
        this.prisma.user.update({
          where: { id: followingId },
          data: { followersCount: { increment: 1 } },
        }),
        this.prisma.user.update({
          where: { id: followerId },
          data: { followingCount: { increment: 1 } },
        }),
      ]);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new DomainException({
          code: DomainExceptionCode.Conflict,
          message: 'Already following this user',
          extensions: [{ field: 'userId', message: 'Already following this user' }],
        });
      }
      throw e;
    }
  }

  async delete(followerId: number, followingId: number): Promise<void> {
    const follow = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });

    if (!follow) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Follow not found',
        extensions: [{ field: 'userId', message: 'You are not following this user' }],
      });
    }

    await this.prisma.$transaction([
      this.prisma.follow.delete({
        where: { followerId_followingId: { followerId, followingId } },
      }),
      this.prisma.user.update({
        where: { id: followingId },
        data: { followersCount: { decrement: 1 } },
      }),
      this.prisma.user.update({
        where: { id: followerId },
        data: { followingCount: { decrement: 1 } },
      }),
    ]);
  }

  async findOne(followerId: number, followingId: number): Promise<boolean> {
    const follow = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    return !!follow;
  }
}
