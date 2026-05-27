import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { LoginUserInputDto } from '../../../modules/user-account/api/input-dto';
import { AccessTokenResponse } from '../../../modules/user-account/api/types';

export function ApiAuthLoginDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Login user',
      description: 'Login user in system',
    }),
    ApiBody({
      type: LoginUserInputDto,
      description: 'Login user in system',
    }),
    ApiOkResponse({
      description: 'Successfully logged in',
      type: AccessTokenResponse,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}
