import { Injectable } from '@nestjs/common';
import { catchError, firstValueFrom, map, of, retry, timeout } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { CoreConfig } from '../../../../core/core.config';

@Injectable()
export class RecaptchaService {
  constructor(
    private readonly httpService: HttpService,
    private readonly coreConfig: CoreConfig,
  ) {}

  async validate(token: string): Promise<boolean> {
    const secret: string = this.coreConfig.recaptchaSecret;
    const url: string = `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`;

    const source$ = this.httpService.post(url).pipe(
      timeout(3000),
      retry(3),
      map((res) => res.data.success),
      catchError((err) => {
        console.error('Recaptcha error:', err.message);
        return of(false);
      }),
    );

    return firstValueFrom(source$);
  }
}
