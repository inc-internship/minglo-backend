import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DomainException, DomainExceptionCode } from '@app/exceptions';

@Injectable()
export class GoogleGuard extends AuthGuard('google') {}

@Injectable()
export class GoogleCallbackGuard extends AuthGuard('google') {
  handleRequest(err: any, user: any) {
    if (err) {
      throw err;
    }

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Google OAuth failed',
      });
    }

    return user;
  }
}
