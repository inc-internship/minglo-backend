import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOperation,
  getSchemaPath,
} from '@nestjs/swagger';
import { ErrorResponseBody } from '@app/exceptions';
import { MediaTypeInputDto } from '@app/media/api/input-dto';
import { UploadImageResultDto } from '@app/media/dto';

export function ApiUploadAvatarDecorator() {
  return applyDecorators(
    ApiExtraModels(MediaTypeInputDto),
    ApiOperation({
      summary: 'Upload avatar image',
      description:
        'Загрузка одного изображения до 3 MB. Поля type и publicUserId передаются как текстовые поля multipart/form-data.',
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
                description: 'Файл изображения (png, jpg, webp)',
              },
            },
            required: ['file'],
          },
          { $ref: getSchemaPath(MediaTypeInputDto) },
        ],
      },
    }),
    ApiBadRequestResponse({
      type: ErrorResponseBody,
    }),
    ApiCreatedResponse({
      type: UploadImageResultDto,
      description: 'Успешная загрузка',
    }),
  );
}
