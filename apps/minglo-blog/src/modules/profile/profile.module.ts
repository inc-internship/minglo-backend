import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MEDIA_ACCESS_TOKEN_STRATEGY_INJECT_TOKEN, MEDIA_SERVICE } from '@app/media/constants';
import { JwtService } from '@nestjs/jwt';
import { CoreConfig } from '../../core/core.config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserAccountModule } from '../user-account/user-account.module';
import { ProfileController } from './api/profile.controller';
import { ProfileRepository } from './infrastructure/profile.repository';
import { GetUsersSearchQueryHandler, ViewProfileHandler } from './application/queries';
import { ProfileQueryRepository } from './infrastructure/queries/profile.query.repository';
import {
  DeleteAvatarUseCase,
  UpdateProfileUseCase,
  UploadAvatarImagesUseCase,
} from './application/usecases';
import { UserSearchController } from './api/user-search.controller';

const usecases = [UploadAvatarImagesUseCase, DeleteAvatarUseCase, UpdateProfileUseCase];
const queries = [ViewProfileHandler, GetUsersSearchQueryHandler];

@Module({
  imports: [
    HttpModule,
    ClientsModule.registerAsync([
      {
        name: MEDIA_SERVICE,
        useFactory: (config: CoreConfig) => ({
          transport: Transport.TCP,
          options: {
            host: config.mediaTcpHost,
            port: config.mediaTcpPort,
          },
        }),
        inject: [CoreConfig],
      },
    ]),
    UserAccountModule,
  ],
  controllers: [ProfileController, UserSearchController],
  providers: [
    ...usecases,
    ...queries,
    ProfileRepository,
    ProfileQueryRepository,
    {
      provide: MEDIA_ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (config: CoreConfig): JwtService => {
        return new JwtService({
          secret: config.mediaAccessSecret,
          signOptions: { expiresIn: config.mediaAccessTokenExpIn },
        });
      },
      inject: [CoreConfig],
    },
  ],
})
export class ProfileModule {}
