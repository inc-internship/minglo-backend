import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { ActiveUserDto } from './dto/active-user.dto';

export const CurrentUser = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();
  const user: ActiveUserDto = request.user;

  if (!user)
    throw new DomainException({
      code: DomainExceptionCode.NotFound,
      message: 'User not found',
    });

  return user;
});
