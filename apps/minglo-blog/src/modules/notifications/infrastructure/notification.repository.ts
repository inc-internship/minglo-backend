import { Injectable } from '@nestjs/common';
import {
  Notification,
  Prisma,
  NotificationType as PrismaNotificationType,
} from '../../../../prisma/generated/prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { NotificationType } from '../../../shared/enums';
import { NotificationsWithCursorViewDto } from '../api/view-dto/notifications-with-cursor.view-dto';
import { NotificationViewDto } from '../api/view-dto/notification.view-dto';

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    userId: string;
    type: NotificationType;
    message: string;
  }): Promise<Notification> {
    return this.prisma.notification.create({
      data: {
        type: data.type as PrismaNotificationType,
        message: data.message,
        user: { connect: { publicId: data.userId } },
      },
    });
  }

  async findByIdAndUserId(id: string, userId: string): Promise<Notification> {
    const record = await this.prisma.notification.findFirst({
      where: { id, user: { publicId: userId } },
    });

    if (!record) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Notification not found',
      });
    }
    return record;
  }

  async findManyByUserIdWithCursor(
    userId: string,
    cursor?: string,
    limit: number = 20,
  ): Promise<NotificationsWithCursorViewDto> {
    const where = { user: { publicId: userId } };

    const [records, totalCount] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit + 1,
        ...(cursor && { skip: 1, cursor: { id: cursor } }),
      }),

      this.prisma.notification.count({ where }),
    ]);

    const hasNextPage = records.length > limit;
    const items = hasNextPage ? records.slice(0, limit) : records;
    const nextCursor = hasNextPage ? items[items.length - 1].id : null;

    return {
      items: items.map((n) => NotificationViewDto.mapToView(n)),
      nextCursor,
      hasNextPage,
      totalCount,
    };
  }

  async markAllRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { user: { publicId: userId }, isRead: false },
      data: { isRead: true },
    });
  }

  async markOneRead(id: string): Promise<void> {
    await this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async deleteById(id: string): Promise<void> {
    try {
      await this.prisma.notification.delete({ where: { id } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new DomainException({
          code: DomainExceptionCode.NotFound,
          message: 'Notification not found',
        });
      }
      throw e;
    }
  }
}
