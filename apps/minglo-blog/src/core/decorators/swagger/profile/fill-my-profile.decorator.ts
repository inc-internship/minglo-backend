import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FillProfileInputDto } from '../../../../modules/profile/api/input-dto';

export function ApiFillMyProfileDecorator() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Initial profile completion (Required)',
      description: 'First-time profile setup. First name and Last name are mandatory to proceed.',
    }),
    ApiBody({
      type: FillProfileInputDto,
    }),
    ApiOkResponse({
      description: 'Profile filled successfully.',
    }),
    ApiBadRequestResponse({
      description:
        'Validation failed. Make sure required fields (firstName, lastName) are provided.',
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized - Access token is missing or invalid.',
    }),
  );
}
