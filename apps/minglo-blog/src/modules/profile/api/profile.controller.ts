import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { type Request } from 'express';
import { LoggerService } from '@app/logger';
import { AccessGuard } from '../../user-account/guards/access.guard';
import { OptionalAccessGuard } from '../../user-account/guards/optional-access.guard';
import { CurrentUser } from '../../../core/decorators/auth/current-user.decorator';
import { ActiveUserDto } from '../../../core/decorators/auth/dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import {
  ApiDeleteAvatarDecorator,
  ApiProfileUploadImagesDecorator,
  ApiUpdateMyProfileDecorator,
  ApiViewProfileDecorator,
} from '../../../core/decorators/swagger/profile';
import { UploadImageProfileDto } from '@app/media/dto/upload-image-profile.dto';
import { extractFileStream } from '@app/media/helpers';
import { ProfileViewDto } from './view-dto';
import { DeleteAvatarInputDto, UpdateProfileInputDto } from './input-dto';
import { ViewProfileQuery } from '../application/queries';
import {
  DeleteAvatarCommand,
  UpdateProfileCommand,
  UploadAvatarImagesCommand,
} from '../application/usecases';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly logger: LoggerService,
    private readonly queryBus: QueryBus,
  ) {
    this.logger.setContext(ProfileController.name);
  }

  @Post('upload-image')
  @ApiProfileUploadImagesDecorator()
  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.CREATED)
  async uploadMediaFile(
    @CurrentUser() user: ActiveUserDto,
    @Req() req: Request,
  ): Promise<UploadImageProfileDto> {
    this.logger.log(
      `New media(profile) upload request received from user: ${user.userId}`,
      'uploadMediaFile',
    );

    try {
      const { stream, filename } = await extractFileStream(req, { fileSizeLimit: 3 * 1024 * 1024 });

      return await this.commandBus.execute<UploadAvatarImagesCommand, UploadImageProfileDto>(
        new UploadAvatarImagesCommand(stream, filename, user),
      );
    } catch (err) {
      this.logger.error(`Upload failed: ${err.message}, stack: ${err.stack}`);
      if (err instanceof DomainException) {
        throw err;
      }

      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'Media Service is unavailable',
      });
    }
  }

  @Delete('avatar')
  @ApiDeleteAvatarDecorator()
  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAvatar(@CurrentUser() user: ActiveUserDto, @Body() body: DeleteAvatarInputDto) {
    this.logger.log(`Delete avatar for user: ${user.userId}`, 'deleteAvatar');
    return await this.commandBus.execute<DeleteAvatarCommand, void>(
      new DeleteAvatarCommand(body.mediaId, user),
    );
  }

  @Get(':userId')
  @ApiViewProfileDecorator()
  @UseGuards(OptionalAccessGuard)
  @HttpCode(HttpStatus.OK)
  async viewProfile(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: ActiveUserDto | null,
  ) {
    this.logger.log(`Check profile: ${userId}`, 'viewProfile');
    return await this.queryBus.execute<ViewProfileQuery, ProfileViewDto>(
      new ViewProfileQuery(userId, currentUser ?? null),
    );
  }

  @Put()
  @ApiUpdateMyProfileDecorator()
  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(@CurrentUser() user: ActiveUserDto, @Body() body: UpdateProfileInputDto) {
    this.logger.log(`Update my profile: ${user.userId}`, 'update');
    return await this.commandBus.execute<UpdateProfileCommand, void>(
      new UpdateProfileCommand(user, body),
    );
  }
}
