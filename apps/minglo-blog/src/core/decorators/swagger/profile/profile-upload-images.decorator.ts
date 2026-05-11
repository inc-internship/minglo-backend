import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseBody } from '@app/exceptions';
import { MediaTypeInputDto } from '@app/media/api/input-dto';
import { UploadImageResultDto } from '@app/media/dto';

export function ApiProfileUploadImagesDecorator() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiExtraModels(MediaTypeInputDto),
    ApiOperation({
      summary: 'Upload image for profile',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        allOf: [
          {
            type: 'object',
            properties: {
              file: {
                type: 'string',
                format: 'binary',
              },
            },
            required: ['file'],
          },
        ],
      },
    }),
    ApiBadRequestResponse({
      type: ErrorResponseBody,
    }),
    ApiCreatedResponse({
      type: UploadImageResultDto,
      description: 'Success',
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}
