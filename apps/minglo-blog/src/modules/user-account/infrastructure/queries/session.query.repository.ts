import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { SessionViewDto } from '../../api/view-dto/session-view.dto';

@Injectable()
export class SessionQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getSession(id: string) {
    const devices = await this.prisma.session.findMany({
      where: {
        deletedAt: null,
        user: {
          publicId: id,
          deletedAt: null,
        },
      },
    });
    return SessionViewDto.mapToManyView(devices);
  }
}
