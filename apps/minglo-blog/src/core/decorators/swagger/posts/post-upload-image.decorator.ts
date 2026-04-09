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

export function ApiPostsUploadImageDecorator() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiExtraModels(MediaTypeInputDto),
    ApiOperation({
      summary: 'Upload images for new post',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        allOf: [
          {
            type: 'object',
            properties: {
              files: {
                type: 'array',
                items: {
                  type: 'string',
                  format: 'binary',
                },
                minItems: 1,
                maxItems: 10,
                description: '20 Mb max file size',
              },
            },
            required: ['files'],
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
