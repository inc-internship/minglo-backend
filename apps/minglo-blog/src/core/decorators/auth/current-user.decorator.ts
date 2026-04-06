import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ActiveUserDto } from './dto/active-user.dto';

export const CurrentUser = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();
  const user: ActiveUserDto = request.user;

  return user;
});
