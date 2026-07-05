import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTooManyRequestsResponse } from '@nestjs/swagger';
import { TotalCountRegisteredUsersViewDto } from '../../../../modules/user-account/api/view-dto';

export function ApiUsersTotalCountDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get total count registered users in app',
    }),
    ApiOkResponse({
      type: TotalCountRegisteredUsersViewDto,
      description: 'Success',
    }),
    ApiTooManyRequestsResponse({
      description: 'Too many attempts from the same IP address. Please try again later.',
    }),
  );
}
