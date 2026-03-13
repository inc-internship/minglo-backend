import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { CreateUserInputDto } from '../../../modules/user-account/api/input-dto';
import { ErrorResponseBody } from '@app/exceptions';

export function ApiAuthRegistration() {
  return applyDecorators(
    ApiBody({
      type: CreateUserInputDto,
      description: 'Register user in system',
    }),
    ApiNoContentResponse({
      description:
        'User successfully registered. Email has been sent to the specified email address',
    }),
    ApiBadRequestResponse({
      description: 'Validation failed or user data is invalid',
      type: ErrorResponseBody,
    }),
    ApiConflictResponse({
      description: 'Login or email already exists',
    }),
  );
}
