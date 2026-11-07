import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiNoContentResponse,
  ApiOperation,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ToggleAutoRenewalInputDto } from '../../../../modules/billing/api/input-dto/toggle-auto-renewal.input-dto';

export function ApiToggleAutoRenewal() {
  return applyDecorators(
    ApiOperation({
      summary: 'Toggle auto-renewal',
      description:
        'Enables or disables automatic renewal of the current subscription. ' +
        'When disabled, the subscription expires at the end of the current period.',
    }),
    ApiBearerAuth('access-token'),
    ApiBody({ type: ToggleAutoRenewalInputDto }),
    ApiNoContentResponse({ description: 'Auto-renewal updated successfully' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiTooManyRequestsResponse({ description: 'Too many requests' }),
  );
}
