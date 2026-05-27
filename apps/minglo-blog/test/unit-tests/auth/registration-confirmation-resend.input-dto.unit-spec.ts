import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RegistrationConfirmationResendInputDto } from '../../../src/modules/user-account/api/input-dto';

const validDto = {
  email: 'valid@gmail.com',
  redirectUrl: 'https://minglo.blog/auth/confirm',
};

async function getErrorFields(dto: object): Promise<string[]> {
  const instance = plainToInstance(RegistrationConfirmationResendInputDto, dto);
  const errors = await validate(instance, { stopAtFirstError: true });
  return errors.map((e) => e.property);
}

describe('RegistrationConfirmationResendInputDto — валидация', () => {
  it('валидный dto не содержит ошибок', async () => {
    const fields = await getErrorFields(validDto);
    expect(fields).toHaveLength(0);
  });

  it('невалидный email возвращает ошибку поля email', async () => {
    const fields = await getErrorFields({ ...validDto, email: 'not-an-email' });
    expect(fields).toContain('email');
  });

  it('отсутствующий email возвращает ошибку поля email', async () => {
    const fields = await getErrorFields({ ...validDto, email: undefined });
    expect(fields).toContain('email');
  });

  it('невалидный redirectUrl возвращает ошибку поля redirectUrl', async () => {
    const fields = await getErrorFields({ ...validDto, redirectUrl: 'not-a-url' });
    expect(fields).toContain('redirectUrl');
  });

  it('отсутствующий redirectUrl возвращает ошибку поля redirectUrl', async () => {
    const fields = await getErrorFields({ ...validDto, redirectUrl: undefined });
    expect(fields).toContain('redirectUrl');
  });
});
