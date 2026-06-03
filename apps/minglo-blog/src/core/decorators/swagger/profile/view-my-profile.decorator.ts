import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ProfileViewDto } from '../../../../modules/profile/api/view-dto';

export function ApiViewProfileDecorator() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Get profile by user ID',
      description: 'Returns profile information for the given user public ID.',
    }),
    ApiParam({ name: 'userId', type: String, description: 'User public ID' }),
    ApiOkResponse({
      description: 'Profile successfully retrieved.',
      type: ProfileViewDto,
    }),
    ApiUnauthorizedResponse({ description: 'Access token is missing or invalid.' }),
    ApiNotFoundResponse({ description: 'Profile not found.' }),
  );
}
