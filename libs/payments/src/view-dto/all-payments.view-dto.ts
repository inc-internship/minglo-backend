import { PaymentStatus, PaymentSystem } from '../enums';

export class AllPaymentItemViewDto {
  id: string;
  userId: string;
  paymentDate: string;
  amount: string;
  planName: string;
  paymentSystem: PaymentSystem;
  status: PaymentStatus;
}

export class AllPaymentsViewDto {
  items: AllPaymentItemViewDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  pagesCount: number;
}
