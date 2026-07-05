import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateConversationInputDto } from './input-dto/create-conversation.input-dto';
import { ConversationViewDto } from './view-dto/conversation.view-dto';
import { ConversationsWithCursorViewDto } from './view-dto/conversations-with-cursor.view-dto';
import { GetOrCreateDmCommand } from '../application/usecases/get-or-create-dm.usecase';
import { GetConversationsQuery } from '../application/queries/get-conversations.query';
import { GetConversationQuery } from '../application/queries/get-conversation.query';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { ActiveUserDto } from '../decorators/active-user.dto';

@ApiTags('Conversations')
@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class ConversationsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Get or create a DM conversation' })
  @ApiResponse({ status: 201, schema: { properties: { conversationPublicId: { type: 'string' } } } })
  async getOrCreateConversation(
    @Body() dto: CreateConversationInputDto,
    @CurrentUser() user: ActiveUserDto,
  ): Promise<{ conversationPublicId: string }> {
    return this.commandBus.execute(
      new GetOrCreateDmCommand(user.userId, dto.participantPublicId),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get list of conversations (cursor pagination)' })
  @ApiResponse({ status: 200, type: ConversationsWithCursorViewDto })
  async getConversations(
    @CurrentUser() user: ActiveUserDto,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ): Promise<ConversationsWithCursorViewDto> {
    return this.queryBus.execute(
      new GetConversationsQuery(user.userId, cursor, limit ? Number(limit) : 20),
    );
  }

  @Get(':conversationId')
  @ApiOperation({ summary: 'Get conversation by id' })
  @ApiResponse({ status: 200, type: ConversationViewDto })
  async getConversation(
    @Param('conversationId') conversationId: string,
    @CurrentUser() user: ActiveUserDto,
  ): Promise<ConversationViewDto> {
    return this.queryBus.execute(new GetConversationQuery(user.userId, conversationId));
  }
}