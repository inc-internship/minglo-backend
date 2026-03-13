import { Injectable } from '@nestjs/common';
import { CryptoService } from '../../application/services/crypto.service';
import { UserEntity } from '../entities';

type UserCreateArgs = {
  login: string;
  email: string;
  password: string;
  forSA?: boolean;
};

@Injectable()
export class UserFactory {
  constructor(private readonly crypto: CryptoService) {}

  async create(args: UserCreateArgs): Promise<UserEntity> {
    const { login, email, password, forSA = false } = args;

    const passwordHash = await this.crypto.hashPassword(password);

    const user = UserEntity.create({ login, email, passwordHash });

    // если юзера создает админ, тогда сразу подтверждаем
    if (forSA) {
      user.confirm();
    }

    return user;
  }
}
