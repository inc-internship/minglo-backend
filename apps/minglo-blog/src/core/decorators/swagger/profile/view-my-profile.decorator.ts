import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { MyProfileViewDto } from '../../../../modules/profile/api/view-dto';

export function ApiViewMyProfileDecorator() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Get current user profile',
      description: 'Returns detailed profile information including the avatar and user login.',
    }),
    ApiOkResponse({
      description: 'The profile has been successfully retrieved.',
      type: MyProfileViewDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized: Access token is missing or invalid.',
    }),
  );
}
