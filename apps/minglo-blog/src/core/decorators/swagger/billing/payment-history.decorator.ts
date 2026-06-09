import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PaymentHistoryViewDto } from '@app/payments/view-dto';

export function ApiGetPaymentHistory() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get payment history',
      description: 'Returns a paginated list of all payments for the authenticated user.',
    }),
    ApiBearerAuth('access-token'),
    ApiOkResponse({ type: PaymentHistoryViewDto }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiTooManyRequestsResponse({ description: 'Too many requests' }),
  );
}
