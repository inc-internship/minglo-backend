import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { DeleteAvatarInputDto } from '../../../../modules/profile/api/input-dto';

export function ApiDeleteAvatarDecorator() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Delete avatar',
      description: 'Deletes both original and thumbnail images from storage and the database.',
    }),
    ApiBody({ type: DeleteAvatarInputDto }),
    ApiNoContentResponse({ description: 'Avatar deleted successfully.' }),
    ApiNotFoundResponse({ description: 'Avatar not found.' }),
    ApiBadRequestResponse({ description: 'Validation failed.' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized.' }),
  );
}
