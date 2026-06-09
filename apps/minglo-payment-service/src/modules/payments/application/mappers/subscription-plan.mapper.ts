import { GetSubscriptionPlansViewDto, SubscriptionPlanViewDto } from '@app/payments/view-dto';
import { Plan } from 'apps/minglo-payment-service/prisma/generated/prisma/client';

export class SubscriptionPlanMapper {
  static toViewDto(plan: Plan): SubscriptionPlanViewDto {
    return {
      id: plan.id,
      name: plan.name,
      durationDays: plan.durationDays,
      price: plan.price.toString(),
      currency: plan.currency,
    };
  }

  static toListViewDto(plans: Plan[]): GetSubscriptionPlansViewDto {
    return { data: plans.map((p) => SubscriptionPlanMapper.toViewDto(p)) };
  }
}
