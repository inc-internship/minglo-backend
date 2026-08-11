import { Field, InputType } from '@nestjs/graphql';
import { IsDateString, IsEnum } from 'class-validator';
import { AnalyticsMetric } from '../enums/analytics-metric.enum';

@InputType()
export class AnalyticsQueryInput {
  @IsEnum(AnalyticsMetric)
  @Field(() => AnalyticsMetric)
  metric: AnalyticsMetric;

  @IsDateString()
  @Field()
  dateFrom: string;

  @IsDateString()
  @Field()
  dateTo: string;
}
