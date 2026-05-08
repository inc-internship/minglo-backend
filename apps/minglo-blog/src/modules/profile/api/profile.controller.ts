import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { type Request } from 'express';
import { LoggerService } from '@app/logger';
import { AccessGuard } from '../../user-account/guards/access.guard';
import { CurrentUser } from '../../../core/decorators/auth/current-user.decorator';
import { ActiveUserDto } from '../../../core/decorators/auth/dto';
import { CommandBus } from '@nestjs/cqrs';
import { UploadAvatarImagesCommand } from '../application/usecases/upload-avatar-image.usecase';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import {
  ApiCreateAvatarDecorator,
  ApiProfileUploadImagesDecorator,
} from '../../../core/decorators/swagger/profile';
import { UploadImageProfileDto } from '@app/media/dto/upload-image-profile.dto';
import { extractFileStream } from '@app/media/helpers';
import { CreateAvatarCommand } from '../application/usecases/create-avatar.usecase';
import { CreateAvatarViewDto } from './view-dto';
import { CreateAvatarInputDto } from './input-dto';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(ProfileController.name);
  }

  @Post('upload-image')
  @ApiProfileUploadImagesDecorator()
  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.CREATED)
  async uploadMediaFile(
    @CurrentUser() user: ActiveUserDto,
    req: Request,
  ): Promise<UploadImageProfileDto> {
    this.logger.log(
      `New media(profile) upload request received from user: ${user.userId}`,
      'uploadMediaFile',
    );

    try {
      const { stream, filename } = await extractFileStream(req);

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

  @Post('create-avatar')
  @ApiCreateAvatarDecorator()
  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.CREATED)
  async createAvatar(@Body() body: CreateAvatarInputDto, @CurrentUser() user: ActiveUserDto) {
    this.logger.log(`Create new Avatar photo for user: ${user.userId}`, 'create');
    return this.commandBus.execute<CreateAvatarCommand, CreateAvatarViewDto>(
      new CreateAvatarCommand(body, user.userId),
    );
  }
}
