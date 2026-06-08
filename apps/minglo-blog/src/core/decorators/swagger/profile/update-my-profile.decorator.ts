import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UpdateProfileInputDto } from '../../../../modules/profile/api/input-dto';

export function ApiUpdateMyProfileDecorator() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Update user profile',
      description:
        'Updates personal information like name, birthday, location and login. All fields are optional. ' +
        'Login must be unique across the system.',
    }),
    ApiBody({
      type: UpdateProfileInputDto,
    }),
    ApiNoContentResponse({
      description: 'Profile updated successfully. No content returned.',
    }),
    ApiBadRequestResponse({
      description: 'Invalid input data (e.g., validation failed or incorrect date format).',
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized - Access token is missing or invalid.',
    }),
    ApiConflictResponse({
      description: 'Login is already taken by another user.',
    }),
  );
}
