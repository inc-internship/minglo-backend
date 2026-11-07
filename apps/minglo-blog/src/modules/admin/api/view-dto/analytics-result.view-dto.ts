import { Field, Float, ObjectType } from '@nestjs/graphql';

export interface AnalyticsRawPoint {
  date: string;
  count: number;
}

@ObjectType()
export class AnalyticsPointType {
  @Field() date: string;
  @Field(() => Float) value: number;
}

@ObjectType()
export class AnalyticsResultType {
  @Field(() => [AnalyticsPointType]) current: AnalyticsPointType[];
  @Field(() => [AnalyticsPointType]) previous: AnalyticsPointType[];

  static mapToView(
    currentRaw: AnalyticsRawPoint[],
    previousRaw: AnalyticsRawPoint[],
    currentFrom: string,
    currentTo: string,
    previousFrom: string,
    previousTo: string,
  ): AnalyticsResultType {
    const dto = new AnalyticsResultType();
    dto.current = AnalyticsResultType.fillRange(currentRaw, currentFrom, currentTo);
    dto.previous = AnalyticsResultType.fillRange(previousRaw, previousFrom, previousTo);
    return dto;
  }

  private static fillRange(
    raw: AnalyticsRawPoint[],
    from: string,
    to: string,
  ): AnalyticsPointType[] {
    const valueByDate = new Map(raw.map((point) => [point.date, point.count]));

    const points: AnalyticsPointType[] = [];
    const cursor = new Date(`${from}T00:00:00.000Z`);
    const end = new Date(`${to}T00:00:00.000Z`);

    while (cursor <= end) {
      const dateStr = cursor.toISOString().slice(0, 10);
      const point = new AnalyticsPointType();
      point.date = dateStr;
      point.value = valueByDate.get(dateStr) ?? 0;
      points.push(point);
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return points;
  }
}
