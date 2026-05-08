import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateAvatarInputDto } from '../../../../modules/profile/api/input-dto';
import { CreateAvatarViewDto } from '../../../../modules/profile/api/view-dto';

export function ApiCreateAvatarDecorator() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Create new avatar',
      description:
        'Creates a avatar using uploadIds previously obtained from /media/upload-image. Media files are not uploaded here.',
    }),
    ApiBody({
      type: CreateAvatarInputDto,
    }),
    ApiCreatedResponse({
      type: CreateAvatarViewDto,
      description: 'Success',
      example: {
        id: 'created_avatar_id',
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}
