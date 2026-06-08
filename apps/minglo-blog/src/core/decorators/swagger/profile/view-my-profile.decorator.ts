import { applyDecorators } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ProfileViewDto } from '../../../../modules/profile/api/view-dto';

export function ApiViewProfileDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get profile by user ID',
      description: 'Returns profile information for the given user public ID.',
    }),
    ApiParam({ name: 'userId', type: String, description: 'User public ID' }),
    ApiOkResponse({
      description: 'Profile successfully retrieved.',
      type: ProfileViewDto,
    }),
    ApiNotFoundResponse({ description: 'Profile not found.' }),
  );
}
