import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { LoginResult } from '../../../modules/user-account/api/types/login-result';

export const OAuthResult = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): LoginResult => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // то что Passport положил через done(null, loginResult)
  },
);
