import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ActiveUserDto } from './active-user.dto';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): ActiveUserDto => {
    const request = context.switchToHttp().getRequest();
    return request.user as ActiveUserDto;
  },
);