import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RecaptchaService } from '../application/services/recaptcha.service';
import { DomainException, DomainExceptionCode } from '@app/exceptions';

@Injectable()
export class RecaptchaGuard implements CanActivate {
  constructor(private readonly recaptchaService: RecaptchaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.body.captchaValue;

    if (!token) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Not found recaptcha token',
      });
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
