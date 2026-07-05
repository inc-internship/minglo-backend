import { Body, Controller, Get, HttpCode, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SendMessageInputDto } from './input-dto/send-message.input-dto';
import { MessagesWithCursorViewDto } from './view-dto/messages-with-cursor.view-dto';
import { SendMessageCommand } from '../application/usecases/send-message.usecase';
import { MarkReadCommand } from '../application/usecases/mark-read.usecase';
import { GetMessagesQuery } from '../application/queries/get-messages.query';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { ActiveUserDto } from '../decorators/active-user.dto';

@ApiTags('Messages')
@UseGuards(JwtAuthGuard)
@Controller('conversations/:conversationId')
export class MessagesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('messages')
  @ApiOperation({ summary: 'Get message history (cursor pagination, newest first)' })
  @ApiResponse({ status: 200, type: MessagesWithCursorViewDto })
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
  @ApiOperation({ summary: 'Send a message (HTTP fallback)' })
  @ApiResponse({ status: 201 })
  async sendMessage(
    @Param('conversationId') conversationId: string,
    @Body() dto: SendMessageInputDto,
    @CurrentUser() user: ActiveUserDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new SendMessageCommand(user.userId, conversationId, dto.text),
    );
  }

  @Post('read')
  @HttpCode(204)
  @ApiOperation({ summary: 'Mark conversation as read (reset unread count)' })
  @ApiResponse({ status: 204 })
  async markRead(
    @Param('conversationId') conversationId: string,
    @CurrentUser() user: ActiveUserDto,
  ): Promise<void> {
    return this.commandBus.execute(new MarkReadCommand(user.userId, conversationId));
  }
}