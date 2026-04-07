import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  getSchemaPath,
} from '@nestjs/swagger';
import { ErrorResponseBody } from '@app/exceptions';
import { MediaTypeInputDto } from '@app/media/api/input-dto';

export function ApiUploadFilesDecorator() {
  return applyDecorators(
    ApiExtraModels(MediaTypeInputDto),
    ApiOperation({
      summary: 'Upload image file',
      description: 'Массив изображений (png, jpg, webp) до 3 MB каждый.',
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
              },
            },
            required: ['files'],
          },
          {
            $ref: getSchemaPath(MediaTypeInputDto),
          },
        ],
      },
    }),
    ApiBadRequestResponse({
      type: ErrorResponseBody,
    }),
    ApiOkResponse({
      description: 'Success',
    }),
  );
}
