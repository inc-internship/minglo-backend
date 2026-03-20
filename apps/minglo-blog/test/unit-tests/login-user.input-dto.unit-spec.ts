import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { LoginUserInputDto } from '../../src/modules/user-account/api/input-dto/login-user.input.dto';

const validLoginDto = {
  email: 'valid@gmail.com',
  password: 'Qwerty123!',
};

async function getErrorFields(dto: object): Promise<string[]> {
  const instance = plainToInstance(LoginUserInputDto, dto);
  const errors = await validate(instance, { stopAtFirstError: true });
  return errors.map((e) => e.property);
}

describe('LoginUserInputDto — валидация', () => {
  it('валидный dto для логина не содержит ошибок', async () => {
    const fields = await getErrorFields(validLoginDto);
    expect(fields).toHaveLength(0);
  });

  it('невалидный email (пустой или кривой) возвращает ошибку', async () => {
    const fields = await getErrorFields({ ...validLoginDto, email: 'shlak' });
    expect(fields).toContain('email');
  });

  it('пароль, не подходящий под регулярку, возвращает ошибку', async () => {
    const fields = await getErrorFields({ ...validLoginDto, password: '123' });
    expect(fields).toContain('password');
  });
});
