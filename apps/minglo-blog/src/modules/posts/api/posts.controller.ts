import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { LoggerService } from '@app/logger';
import { AccessGuard } from '../../user-account/guards/access.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../../../core/decorators/auth/current-user.decorator';
import { ActiveUserDto } from '../../../core/decorators/auth/dto';
import { ImageFilesValidationPipe } from '@app/media/pipes';
import { CoreConfig } from '../../../core/core.config';
import FormData from 'form-data';
import { ApiPostsUploadImageDecorator } from '../../../core/decorators/swagger/posts';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { UploadImageResultDto } from '@app/media/dto';
import { MediaType } from '@app/media/enums';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly logger: LoggerService,
    private readonly coreConfig: CoreConfig,
    private readonly httpService: HttpService,
  ) {
    this.logger.setContext(PostsController.name);
  }

  @Post('upload-image')
  @ApiPostsUploadImageDecorator()
  @UseGuards(AccessGuard)
  @UseInterceptors(FilesInterceptor('files', 10))
  @HttpCode(HttpStatus.CREATED)
  async uploadImage(
    @UploadedFiles(new ImageFilesValidationPipe())
    files: Express.Multer.File[],
    @CurrentUser() user: ActiveUserDto,
  ): Promise<UploadImageResultDto> {
    const form = new FormData();

    for (const file of files) {
      form.append('files', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });
    }
    form.append('type', MediaType.POST);
    form.append('publicUserId', user.userId);

    const { data } = await firstValueFrom(
      this.httpService
        .post<UploadImageResultDto>(`${this.coreConfig.mediaServiceUrl}/media/upload`, form, {
          headers: form.getHeaders(),
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error, `Minglo Media Service is unavailable`);
            throw new DomainException({
              code: DomainExceptionCode.InternalServerError,
              message: 'Minglo Media Service is unavailable',
            });
          }),
        ),
    );

    this.logger.log('New post image(s) uploaded', 'uploadImage');
    return data;
  }
}
