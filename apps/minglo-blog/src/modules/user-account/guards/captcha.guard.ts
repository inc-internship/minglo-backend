import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RecaptchaService } from '../application/services/recaptcha.service';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { CoreConfig } from '../../../core/core.config';

@Injectable()
export class RecaptchaGuard implements CanActivate {
  constructor(
    private readonly recaptchaService: RecaptchaService,
    private readonly config: CoreConfig,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.body.captchaValue;

    if (!token) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Invalid recaptcha token',
      });
    }

    /* Для тестов в swagger */
    const bypassHeader = request.headers['x-recaptcha-bypass'];
    if (!!bypassHeader && bypassHeader === this.config.recaptchaBypassSecret) {
      return true;
    }

    const isValid = await this.recaptchaService.validate(token);

    if (!isValid) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Recaptcha validation failed',
      });
    }

    return true;
  }
}
