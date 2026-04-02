import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { LoginUserInputDto } from '../../src/modules/user-account/api/input-dto';

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

  it('невалидный формат email (строка) не возвращает ошибку валидации DTO', async () => {
    const fields = await getErrorFields({ ...validLoginDto, email: 'shlak' });
    expect(fields).toHaveLength(0);
  });

  it('пароль не подходящий под регулярку (строка) не возвращает ошибку валидации DTO', async () => {
    const fields = await getErrorFields({ ...validLoginDto, password: '123' });
    expect(fields).toHaveLength(0);
  });

  it('email не является строкой — возвращает ошибку', async () => {
    const fields = await getErrorFields({ ...validLoginDto, email: 123 });
    expect(fields).toContain('email');
  });

  it('password не является строкой — возвращает ошибку', async () => {
    const fields = await getErrorFields({ ...validLoginDto, password: null });
    expect(fields).toContain('password');
  });
});
