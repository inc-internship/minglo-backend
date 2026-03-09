import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { UserService } from '../application/services/user.service';
import { UpdateUserInputDto } from './input-dto/update-user.input-dto';
import { CreateUserInputDto } from './input-dto/create-user.input-dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create user' })
  @ApiBody({ type: CreateUserInputDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully created',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Not Found',
  })
  async create(@Body() user: CreateUserInputDto) {
    return this.userService.createUser(user);
  }

  @Get()
  async findAll() {
    return this.userService.findAllUsers({});
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findOneUser({ publicId: id });
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(@Param('id') id: string, @Body() user: UpdateUserInputDto) {
    return this.userService.updateUser({
      where: { publicId: id },
      data: { ...user },
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    return this.userService.deleteUser({ publicId: id });
  }
}
