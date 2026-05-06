import { Injectable } from '@nestjs/common';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { PrismaService } from '../../../../database/prisma.service';
import { User } from '../../../../../prisma/generated/prisma/client';
import { MeViewDto } from '../../api/view-dto/me-view.dto';

@Injectable()
export class UserQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getById(id: string): Promise<MeViewDto> {
    const findUser: User | null = await this.prisma.user.findUnique({
      where: {
        publicId: id,
        deletedAt: null,
      },
    });

    if (!findUser) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'User not found',
      });
    }
    return MeViewDto.mapToView(findUser);
  }

  /* Находить userID по publicId */
  async findIdByPublicId(publicId: string): Promise<number> {
    const user = await this.prisma.user.findFirst({
      where: {
        publicId,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }

    return user.id;
  }

  /**
   * Returns the total number of registered users.
   * - excludes soft-deleted users (`deletedAt IS NULL`)
   * - includes only users with confirmed email (`emailConfirmed = true`)
   */
  async getTotalRegisteredCount(): Promise<number> {
    return this.prisma.user.count({
      where: {
        deletedAt: null,
        emailConfirmed: true,
      },
    });
  }
}
