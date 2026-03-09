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
import { type User } from '../../../../prisma/generated/prisma/client';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() user: User) {
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
  async update(@Param('id') id: string, @Body() user: User) {
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
