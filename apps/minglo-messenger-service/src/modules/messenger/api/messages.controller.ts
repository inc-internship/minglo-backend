import { Body, Controller, Get, HttpCode, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { SendMessageInputDto } from './input-dto/send-message.input-dto';
import { MessagesWithCursorViewDto } from './view-dto/messages-with-cursor.view-dto';
import { SendMessageCommand } from '../application/usecases/send-message.usecase';
import { MarkReadCommand } from '../application/usecases/mark-read.usecase';
import { GetMessagesQuery } from '../application/queries/get-messages.query';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { ActiveUserDto } from '../decorators/active-user.dto';
import {
  ApiGetMessagesDecorator,
  ApiMarkReadDecorator,
  ApiSendMessageDecorator,
} from '../../../core/decorators/swagger/messages';

@ApiTags('Messages')
@UseGuards(JwtAuthGuard)
@Controller('conversations/:conversationId')
export class MessagesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('messages')
  @ApiGetMessagesDecorator()
  async getMessages(
    @Param('conversationId') conversationId: string,
    @CurrentUser() user: ActiveUserDto,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ): Promise<MessagesWithCursorViewDto> {
    return this.queryBus.execute(
      new GetMessagesQuery(user.userId, conversationId, cursor, limit ? Number(limit) : 20),
    );
  }

  @Post('messages')
  @ApiSendMessageDecorator()
  async sendMessage(
    @Param('conversationId') conversationId: string,
    @Body() dto: SendMessageInputDto,
    @CurrentUser() user: ActiveUserDto,
  ): Promise<void> {
    return this.commandBus.execute(new SendMessageCommand(user.userId, conversationId, dto.text));
  }

  @Post('read')
  @HttpCode(204)
  @ApiMarkReadDecorator()
  async markRead(
    @Param('conversationId') conversationId: string,
    @CurrentUser() user: ActiveUserDto,
  ): Promise<void> {
    return this.commandBus.execute(new MarkReadCommand(user.userId, conversationId));
  }
}
