import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { LoggerService } from '@app/logger';
import { MessengerConfig } from '../../../core/messenger.config';

export interface UserProfile {
  login: string;
  avatarUrl: string | null;
}

@Injectable()
export class UserDataService {
  constructor(
    private readonly httpService: HttpService,
    private readonly config: MessengerConfig,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UserDataService.name);
  }

  async getUserProfile(userPublicId: string): Promise<UserProfile> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.config.mingloBlogUrl}/api/v1/profile/${userPublicId}`),
      );
      return {
        login: data.login,
        avatarUrl: data.avatar?.thumbnail?.url ?? null,
      };
    } catch (err) {
      this.logger.warn(`Failed to fetch profile for ${userPublicId}: ${err?.message}`);
      return { login: userPublicId, avatarUrl: null };
    }
  }

  async getUserProfiles(
    userPublicIds: string[],
    chunkSize: number = 10,
  ): Promise<Map<string, UserProfile>> {
    const uniqueIds = [...new Set(userPublicIds)];
    const result = new Map<string, UserProfile>();

    for (let i = 0; i < uniqueIds.length; i += chunkSize) {
      const chunk = uniqueIds.slice(i, i + chunkSize);
      const profiles = await Promise.all(
        chunk.map(async (id) => ({ id, ...(await this.getUserProfile(id)) })),
      );
      for (const { id, login, avatarUrl } of profiles) {
        result.set(id, { login, avatarUrl });
      }
    }

    return result;
  }
}