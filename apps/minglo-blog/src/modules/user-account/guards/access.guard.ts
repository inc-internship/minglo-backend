import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DomainException } from '@app/exceptions';
import { DomainExceptionCode } from '@app/exceptions';

@Injectable()
export class AccessGuard extends AuthGuard('jwt') {
  handleRequest(err, user) {
    if (err || !user) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });
    }
    return user;
  }
}
