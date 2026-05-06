import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiUsersTotalCountDecorator } from '../../../core/decorators/swagger/users';
import { TotalCountRegisteredUsersViewDto } from './view-dto';
import { QueryBus } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { GetTotalRegisteredUserCountQuery } from '../application/queries';

@Controller('users')
export class UsersController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UsersController.name);
  }

  @Get('total-count')
  @ApiUsersTotalCountDecorator()
  @HttpCode(HttpStatus.OK)
  async getTotalRegisteredUsersCount(): Promise<TotalCountRegisteredUsersViewDto> {
    this.logger.log(
      'Get total registered users count request received',
      'getTotalRegisteredUsersCount',
    );

    return this.queryBus.execute<
      GetTotalRegisteredUserCountQuery,
      TotalCountRegisteredUsersViewDto
    >(new GetTotalRegisteredUserCountQuery());
  }
}
