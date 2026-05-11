import { Body, Controller, Get, HttpCode, HttpStatus, Post, Put, UseGuards } from '@nestjs/common';
import { type Request } from 'express';
import { LoggerService } from '@app/logger';
import { AccessGuard } from '../../user-account/guards/access.guard';
import { CurrentUser } from '../../../core/decorators/auth/current-user.decorator';
import { ActiveUserDto } from '../../../core/decorators/auth/dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import {
  ApiCreateAvatarDecorator,
  ApiProfileUploadImagesDecorator,
  ApiUpdateMyProfileDecorator,
  ApiViewMyProfileDecorator,
} from '../../../core/decorators/swagger/profile';
import { UploadImageProfileDto } from '@app/media/dto/upload-image-profile.dto';
import { extractFileStream } from '@app/media/helpers';
import { CreateAvatarViewDto, MyProfileViewDto } from './view-dto';
import { CreateAvatarInputDto, UpdateProfileInputDto } from './input-dto';
import { ViewMyProfileQuery } from '../application/queries';
import {
  CreateAvatarCommand,
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
    return await this.commandBus.execute<CreateAvatarCommand, CreateAvatarViewDto>(
      new CreateAvatarCommand(body, user.userId),
    );
  }

  @Get('me')
  @ApiViewMyProfileDecorator()
  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.OK)
  async viewProfile(@CurrentUser() user: ActiveUserDto) {
    this.logger.log(`Check my profile: ${user.userId}`, 'viewProfile');
    return await this.queryBus.execute<ViewMyProfileQuery, MyProfileViewDto>(
      new ViewMyProfileQuery(user),
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
