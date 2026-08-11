import { registerEnumType } from '@nestjs/graphql';

export enum AnalyticsMetric {
  NEW_USERS = 'NEW_USERS',
  UPLOADED_PHOTOS_SIZE = 'UPLOADED_PHOTOS_SIZE',
  PAID_ACCOUNTS = 'PAID_ACCOUNTS',
}

registerEnumType(AnalyticsMetric, { name: 'AnalyticsMetric' });
