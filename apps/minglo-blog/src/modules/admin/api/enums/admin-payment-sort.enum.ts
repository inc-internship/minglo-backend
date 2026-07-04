import { registerEnumType } from '@nestjs/graphql';
import { PaymentSortField } from '@app/payments/enums';

registerEnumType(PaymentSortField, { name: 'PaymentSortField' });

export { PaymentSortField };
