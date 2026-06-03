import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DomainException, DomainExceptionCode } from '@app/exceptions';

@Injectable()
export class GithubGuard extends AuthGuard('github') {}

@Injectable()
export class GithubCallbackGuard extends AuthGuard('github') {
  handleRequest(err: any, user: any) {
    if (err) throw err;

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'GitHub OAuth failed',
      });
    }

    return user;
  }
}
