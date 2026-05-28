import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { MyProfileViewDto } from '../../api/view-dto';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { LoggerService } from '@app/logger';

@Injectable()
export class ProfileQueryRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(ProfileQueryRepository.name);
  }

  async getMyProfile(id: string): Promise<MyProfileViewDto> {
    const rawData = await this.prisma.profile.findFirst({
      where: {
        deletedAt: null,
        user: {
          publicId: id,
          deletedAt: null,
        },
      },
      include: {
        avatar: true,
        user: {
          select: {
            login: true,
          },
        },
      },
    });

    if (!rawData) {
      this.logger.warn(`profile not found: ${id}`);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'Data integrity breach: Profile not found for existing user',
      });
    }

    return MyProfileViewDto.mapToView(rawData);
  }
}
