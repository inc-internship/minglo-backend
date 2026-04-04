import { Controller, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { CurrentUser } from '../../../core/decorators/auth/current-user.decorator';
import { ActiveUserDto } from '../../../core/decorators/auth/dto';
import { AccessGuard } from '../guards/access.guard';
import { MeViewDto } from './view-dto/me-view.dto';
import { ApiSecurityGetDevicesDecorator } from '../../../core/decorators/swagger';
import { GetDevicesQuery } from '../application/queries/get-devices.query';

@Controller('security')
export class SecurityController {
  constructor(
    private readonly queryBus: QueryBus,
    private logger: LoggerService,
  ) {
    this.logger.setContext(SecurityController.name);
  }

  @Get('devices')
  @ApiSecurityGetDevicesDecorator()
  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.OK)
  async getDevices(@CurrentUser() user: ActiveUserDto): Promise<MeViewDto> {
    this.logger.log('Get devices', 'getDevices');
    return this.queryBus.execute(new GetDevicesQuery(user));
  }
}
