import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../infrastructure/user.repository';
import { DomainException, DomainExceptionCode } from '@app/exceptions';

@Injectable()
export class UserService {
  constructor(private userRepo: UserRepository) {}

  /* Проверяет креды пользователя свободны в системе (login and email) */
  async ensureUserCredentialsAreUnique(login: string, email: string): Promise<void> {
    const existing = await this.userRepo.findFirst(login, email);

    if (!existing) return;

    if (existing.login === login) {
      throw new DomainException({
        code: DomainExceptionCode.Conflict,
        message: 'Login is already in use, pick another.',
        extensions: [{ field: 'login', message: 'Login is already taken.' }],
      });
    }

    if (existing.email === email) {
      throw new DomainException({
        code: DomainExceptionCode.Conflict,
        message: 'Email is already registered, use different',
        extensions: [{ field: 'email', message: 'Email is already taken.' }],
      });
    }
  }
}
