import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GqlExecutionContext, GqlContextType } from '@nestjs/graphql';

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // WS-подписки не имеют HTTP response — throttling для них не применяем
    if (context.getType<GqlContextType>() === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context).getContext();
      if (!gqlCtx.req?.res) {
        return true;
      }
    }
    return super.canActivate(context);
  }

  getRequestResponse(context: ExecutionContext) {
    if (context.getType() === 'http') {
      const http = context.switchToHttp();
      return { req: http.getRequest(), res: http.getResponse() };
    }
    const gqlCtx = GqlExecutionContext.create(context).getContext();
    return { req: gqlCtx.req, res: gqlCtx.req.res };
  }
}
