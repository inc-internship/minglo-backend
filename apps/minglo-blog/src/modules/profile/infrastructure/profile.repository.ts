import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { ProfileEntity } from '../domains/entities/profile.entity';
import { LoggerService } from '@app/logger';
import { AvatarEntity } from '../domains/entities/avatar.entity';
import { ActiveUserDto } from '../../../core/decorators/auth/dto';
import { UpdateProfileInputDto } from '../api/input-dto';

@Injectable()
export class ProfileRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  /* Создает аватар */
  async createAvatar(avatar: AvatarEntity): Promise<string> {
    const result = await this.prisma.avatar.create({
      data: {
        profileId: avatar.profileId,
        mimeType: avatar.mimeType,
        urlLarge: avatar.urlLarge,
        keyLarge: avatar.keyLarge,
        fileSizeLarge: avatar.fileSizeLarge,
        widthLarge: avatar.widthLarge,
        heightLarge: avatar.heightLarge,
        urlSmall: avatar.urlSmall,
        keySmall: avatar.keySmall,
        fileSizeSmall: avatar.fileSizeSmall,
        widthSmall: avatar.widthSmall,
        heightSmall: avatar.heightSmall,
      },
    });
    return result.publicId;
  }

  /* поиск профиля и маппинг его */
  async findProfileById(publicUserId: string): Promise<ProfileEntity> {
    const profile = await this.prisma.profile.findFirst({
      where: {
        deletedAt: null,
        user: {
          publicId: publicUserId,
          deletedAt: null,
        },
      },
    });

    if (!profile) {
      this.logger.error(
        `Critical data inconsistency: User ${publicUserId} exists but has no profile!`,
      );
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: `Inconsistency detected: Profile for user ${publicUserId} is missing.`,
        extensions: [
          { field: 'publicUserId', message: `Profile for user ${publicUserId} is missing` },
        ],
      });
    }

    return ProfileEntity.reconstruct(profile);
  }

  /* Обновление профиля */
  async updateProfile(user: ActiveUserDto, dto: UpdateProfileInputDto): Promise<void> {
    await this.prisma.user.update({
      where: { publicId: user.userId },
      data: {
        profile: {
          update: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            aboutMe: dto.aboutMe,
            countryId: dto.countryId,
            cityId: dto.cityId,
            birthday:
              dto.birthday !== undefined
                ? dto.birthday
                  ? new Date(dto.birthday)
                  : null
                : undefined,
          },
        },
      },
    });
  }

  async softDeleteProfile(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { publicId: id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
