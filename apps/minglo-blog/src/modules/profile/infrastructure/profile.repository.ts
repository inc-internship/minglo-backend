import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { ProfileEntity } from '../domains/entities/profile.entity';
import { LoggerService } from '@app/logger';
import { AvatarEntity } from '../domains/entities/avatar.entity';
import { ActiveUserDto } from '../../../core/decorators/auth/dto';
import { UpdateProfileInputDto } from '../api/input-dto';
import { Avatar } from '../../../../prisma/generated/prisma/client';

@Injectable()
export class ProfileRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Upserts avatar for the given profile.
   */
  async upsertAvatar(avatar: AvatarEntity): Promise<{ avatarId: string; oldKeys: string[] }> {
    const existing = await this.prisma.avatar.findUnique({
      where: { profileId: avatar.profileId },
    });

    // Only collect old keys if the existing avatar is active (not already soft-deleted)
    const oldKeys: string[] =
      existing && !existing.deletedAt ? [existing.keyOriginal, existing.keyThumbnail] : [];

    const result = await this.prisma.avatar.upsert({
      where: { profileId: avatar.profileId },
      create: {
        profileId: avatar.profileId,
        mimeType: avatar.mimeType,
        originalMediaId: avatar.originalMediaId,
        urlOriginal: avatar.urlOriginal,
        keyOriginal: avatar.keyOriginal,
        fileSizeOriginal: avatar.fileSizeOriginal,
        widthOriginal: avatar.widthOriginal,
        heightOriginal: avatar.heightOriginal,
        thumbnailMediaId: avatar.thumbnailMediaId,
        urlThumbnail: avatar.urlThumbnail,
        keyThumbnail: avatar.keyThumbnail,
        fileSizeThumbnail: avatar.fileSizeThumbnail,
        widthThumbnail: avatar.widthThumbnail,
        heightThumbnail: avatar.heightThumbnail,
      },
      update: {
        deletedAt: null,
        mimeType: avatar.mimeType,
        originalMediaId: avatar.originalMediaId,
        urlOriginal: avatar.urlOriginal,
        keyOriginal: avatar.keyOriginal,
        fileSizeOriginal: avatar.fileSizeOriginal,
        widthOriginal: avatar.widthOriginal,
        heightOriginal: avatar.heightOriginal,
        thumbnailMediaId: avatar.thumbnailMediaId,
        urlThumbnail: avatar.urlThumbnail,
        keyThumbnail: avatar.keyThumbnail,
        fileSizeThumbnail: avatar.fileSizeThumbnail,
        widthThumbnail: avatar.widthThumbnail,
        heightThumbnail: avatar.heightThumbnail,
      },
    });

    return { avatarId: result.publicId, oldKeys };
  }

  /* Finds avatar by either originalMediaId or thumbnailMediaId */
  async findAvatarByMediaId(mediaId: string, profileId: number): Promise<Avatar | null> {
    return this.prisma.avatar.findFirst({
      where: {
        deletedAt: null,
        profileId,
        OR: [{ originalMediaId: mediaId }, { thumbnailMediaId: mediaId }],
      },
    });
  }

  /* Soft-deletes the avatar record */
  async deleteAvatar(avatarId: number): Promise<void> {
    await this.prisma.avatar.update({
      where: { id: avatarId },
      data: { deletedAt: new Date() },
    });
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
      this.logger.error(`Data inconsistency: profile for user ${publicUserId} is missing`);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: `Profile for user ${publicUserId} is missing`,
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
}
