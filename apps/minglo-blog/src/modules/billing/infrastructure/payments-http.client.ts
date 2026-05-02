import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CoreConfig } from '../../../core/core.config';
import { LoggerService } from '@app/logger';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PaymentsHttpClient {
  constructor(
    private readonly http: HttpService,
    private readonly config: CoreConfig,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(PaymentsHttpClient.name);
  }

  //todo: add type for data
  async getPlans(): Promise<any> {
    const url = `${this.config.paymentsServiceUrl}/plans`;

    this.logger.log(`Requesting plans from payments service: ${url}`, 'getPlans');

    try {
      //todo: add type for data
      const { data } = await firstValueFrom(this.http.get(url));

      this.logger.log(`Successfully fetched plans.`, 'getPlans');

      return data;
    } catch (error) {
      this.logger.error(`Failed to fetch plans from payments service`, 'getPlans');
      throw error;
    }
  }
}
