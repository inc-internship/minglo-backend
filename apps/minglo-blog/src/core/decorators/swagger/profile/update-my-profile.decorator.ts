import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
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
        'Updates personal information like name, birthday, and location. All fields are optional.',
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
  );
}
