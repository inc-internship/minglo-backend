import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

@Injectable()
export class CryptoService {
  /* генерация bcrypt-хеша пароля */
  async hashPassword(password: string): Promise<string> {
    const salt: string = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /* проверка соответствия пароля и сохранённого хеша */
  async comparePassword(args: { password: string; passwordHash: string }): Promise<boolean> {
    return bcrypt.compare(args.password, args.passwordHash);
  }
}
