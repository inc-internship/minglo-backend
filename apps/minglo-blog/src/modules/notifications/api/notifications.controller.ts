import { Controller, Delete, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AccessGuard } from '../../user-account/guards/access.guard';
import { CurrentUser } from '../../../core/decorators/auth/current-user.decorator';
import { ActiveUserDto } from '../../../core/decorators/auth/dto';
import { NotificationsWithCursorViewDto } from './view-dto/notifications-with-cursor.view-dto';
import { GetNotificationsQueryInputDto } from './input-dto/get-notifications.query.input-dto';
import {
  ApiNotificationsDeleteOneDecorator,
  ApiNotificationsGetAllDecorator,
  ApiNotificationsMarkAllReadDecorator,
  ApiNotificationsMarkOneReadDecorator,
} from '../../../core/decorators/swagger';
import { GetNotificationsQuery } from '../application/queries';
import {
  DeleteNotificationCommand,
  MarkAllNotificationsReadCommand,
  MarkNotificationReadCommand,
} from '../application/usecases';

@Controller('notifications')
@UseGuards(AccessGuard)
export class NotificationsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiNotificationsGetAllDecorator()
  async getAll(
    @Query() query: GetNotificationsQueryInputDto,
    @CurrentUser() user: ActiveUserDto,
  ): Promise<NotificationsWithCursorViewDto> {
    return this.queryBus.execute(new GetNotificationsQuery(user.userId, query.cursor));
  }

  @Patch('read')
  @ApiNotificationsMarkAllReadDecorator()
  async markAllRead(@CurrentUser() user: ActiveUserDto): Promise<void> {
    await this.commandBus.execute(new MarkAllNotificationsReadCommand(user.userId));
  }

  @Patch(':id/read')
  @ApiNotificationsMarkOneReadDecorator()
  async markOneRead(@Param('id') id: string, @CurrentUser() user: ActiveUserDto): Promise<void> {
    await this.commandBus.execute(new MarkNotificationReadCommand(id, user.userId));
  }

  @Delete(':id')
  @ApiNotificationsDeleteOneDecorator()
  async deleteOne(@Param('id') id: string, @CurrentUser() user: ActiveUserDto): Promise<void> {
    await this.commandBus.execute(new DeleteNotificationCommand(id, user.userId));
  }
}
