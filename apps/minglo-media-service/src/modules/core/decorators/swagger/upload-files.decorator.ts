import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { UploadFilesInputDto } from '../../../media/api/input-dto/upload-files.input-dto';
import { ErrorResponseBody } from '@app/exceptions';

export function ApiUploadFilesDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Upload image file',
      description: 'Массив изображений (png, jpg, webp) до 3 MB каждый.',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      type: UploadFilesInputDto,
    }),
    ApiBadRequestResponse({
      type: ErrorResponseBody,
    }),
    ApiOkResponse({
      description: 'Success',
    }),
  );
}
