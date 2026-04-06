import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { CreateUserInputDto } from '../../../modules/user-account/api/input-dto';
import { ErrorResponseBody } from '@app/exceptions';

export function ApiAuthRegistration() {
  return applyDecorators(
    ApiOperation({
      summary: 'Register new user',
      description:
        'Creates a new user account and sends an email confirmation link to the specified email address (code expires in 10 minutes).',
    }),
    ApiBody({
      type: CreateUserInputDto,
      description: 'Register user in system',
    }),
    ApiNoContentResponse({
      description:
        'User successfully registered. Email has been sent to the specified email address',
    }),
    ApiBadRequestResponse({
      description: 'Incorrect input data',
      type: ErrorResponseBody,
    }),
    ApiConflictResponse({
      description: 'login or email already exists',
    }),
    ApiTooManyRequestsResponse({
      description: 'Too many attempts from the same IP address. Please try again later.',
    }),
  );
}
