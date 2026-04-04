import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { GetDevicesViewDto } from '../../api/view-dto/get-devices-view.dto';

@Injectable()
export class SessionQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getDevices(id: string) {
    const devices = await this.prisma.session.findMany({
      where: {
        deletedAt: null,
        user: {
          publicId: id,
          deletedAt: null,
        },
      },
    });
    return GetDevicesViewDto.mapToManyView(devices);
  }
}
