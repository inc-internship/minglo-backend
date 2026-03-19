import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { DomainException, DomainExceptionCode } from '@app/exceptions';

export interface UserMetadata {
  ip: string;
  userAgent: string;
}

export const GetUserMetadata = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  const userAgent = req.headers['user-agent'];

  //мб бот какой то или тому подобное
  if (!userAgent) {
    throw new DomainException({
      code: DomainExceptionCode.Unauthorized,
      message: 'User-Agent header is required',
    });
  }

  return {
    ip: req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress,
    userAgent,
  };
});
