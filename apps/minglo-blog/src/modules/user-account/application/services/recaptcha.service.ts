import { Injectable } from '@nestjs/common';
import { catchError, firstValueFrom, map, of, retry, timeout } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { CoreConfig } from '../../../../core/core.config';
import { LoggerService } from '@app/logger';

@Injectable()
export class RecaptchaService {
  constructor(
    private readonly httpService: HttpService,
    private readonly config: CoreConfig,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(RecaptchaService.name);
  }

  async validate(token: string): Promise<boolean> {
    const secret: string = this.config.recaptchaSecret;
    const url: string = `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`;

    const source$ = this.httpService.post(url).pipe(
      timeout(3000),
      retry(3),
      map((res) => res.data.success),
      catchError((err) => {
        this.logger.error(err);
        return of(false);
      }),
    );

    this.logger.log('Recaptcha validation successful', 'validate');
    return firstValueFrom(source$);
  }
}
