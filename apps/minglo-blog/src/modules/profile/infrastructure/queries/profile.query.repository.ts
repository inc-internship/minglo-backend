import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { ProfileViewDto } from '../../api/view-dto';
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

  async getProfile(id: string): Promise<ProfileViewDto> {
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
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `profile with id: ${id} not found `,
      });
    }

    return ProfileViewDto.mapToView(rawData);
  }
}
