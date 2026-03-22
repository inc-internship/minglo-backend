import { Injectable } from '@nestjs/common';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { PrismaService } from '../../../../database/prisma.service';
import { User } from '../../../../../prisma/generated/prisma/client';
import { UserMeViewDto } from '../../api/view-dto/user-me.view-dto';

@Injectable()
export class UserQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getById(id: string): Promise<UserMeViewDto> {
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
    return UserMeViewDto.mapToView(findUser);
  }
}
