import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { MeViewDto } from '../../../../modules/user-account/api/view-dto/me-view.dto';

export function ApiAuthMeDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get info about current user',
    }),
    ApiBearerAuth('access-token'),
    ApiOkResponse({
      description: 'Success',
      type: MeViewDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}
