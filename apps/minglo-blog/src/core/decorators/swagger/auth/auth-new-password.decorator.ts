import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNoContentResponse,
  ApiOperation,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { ErrorResponseBody } from '@app/exceptions';
import { NewPasswordInputDto } from '../../../../modules/user-account/api/input-dto/new-password.input-dto';

export function ApiAuthNewPasswordDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create new password',
      description: 'Updates the user password using the recovery code sent via email.',
    }),
    ApiBody({
      type: NewPasswordInputDto,
      description: 'New password and confirmation code',
    }),
    ApiNoContentResponse({
      description: 'Password successfully changed.',
    }),
    ApiBadRequestResponse({
      description: 'Invalid or expired code',
      type: ErrorResponseBody,
    }),
    ApiTooManyRequestsResponse({
      description: 'Too many attempts from the same IP address. Please try again later.',
    }),
  );
}
