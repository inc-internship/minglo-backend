import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateUserInputDto } from '../../src/modules/user-account/api/input-dto';

const validDto = {
  login: 'validUser1',
  email: 'valid@gmail.com',
  password: 'Qwerty123',
  redirectUrl: 'https://minglo.blog/auth/confirm',
};

async function getErrorFields(dto: object): Promise<string[]> {
  const instance = plainToInstance(CreateUserInputDto, dto);
  const errors = await validate(instance, { stopAtFirstError: true });
  return errors.map((e) => e.property);
}

describe('CreateUserInputDto — валидация', () => {
  it('валидный dto не содержит ошибок', async () => {
    const fields = await getErrorFields(validDto);
    expect(fields).toHaveLength(0);
  });

  it('невалидный login возвращает ошибку поля login', async () => {
    const fields = await getErrorFields({ ...validDto, login: 'ab' });
    expect(fields).toContain('login');
  });

  it('невалидный email возвращает ошибку поля email', async () => {
    const fields = await getErrorFields({ ...validDto, email: 'not-an-email' });
    expect(fields).toContain('email');
  });

  it('слабый password возвращает ошибку поля password', async () => {
    const fields = await getErrorFields({ ...validDto, password: 'qwerty' });
    expect(fields).toContain('password');
  });

  it('невалидный redirectUrl возвращает ошибку поля redirectUrl', async () => {
    const fields = await getErrorFields({ ...validDto, redirectUrl: 'not-a-url' });
    expect(fields).toContain('redirectUrl');
  });
});
