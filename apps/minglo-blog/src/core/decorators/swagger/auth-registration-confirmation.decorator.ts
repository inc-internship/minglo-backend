import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNoContentResponse,
  ApiOperation,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { ErrorResponseBody } from '@app/exceptions';
import { RegistrationConfirmationInputDto } from '../../../modules/user-account/api/input-dto';

export function ApiAuthRegistrationConfirmation() {
  return applyDecorators(
    ApiOperation({
      summary: 'Confirm user registration',
      description: 'Confirms user email using the registration confirmation code.',
    }),
    ApiBody({
      type: RegistrationConfirmationInputDto,
      description: 'Email confirmation code',
    }),
    ApiNoContentResponse({
      description: 'Email successfully confirmed. User account activated',
    }),
    ApiBadRequestResponse({
      description: 'Invalid or expired code',
      type: ErrorResponseBody,
    }),
    ApiTooManyRequestsResponse({
      description: 'More than 5 attempts from one IP-address during 10 seconds',
    }),
  );
}
