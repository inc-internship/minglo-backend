import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { RegistrationConfirmationInputDto } from '../../../src/modules/user-account/api/input-dto';

describe('RegistrationConfirmationInputDto', () => {
  const validCode = 'b489bca8-98f3-453f-95cd-1170a018755b';

  const getErrors = async (value: unknown) => {
    const dto = plainToInstance(RegistrationConfirmationInputDto, { code: value });
    return validate(dto);
  };

  it('should pass with a valid UUID', async () => {
    const errors = await getErrors(validCode);
    expect(errors).toHaveLength(0);
  });

  it('should fail if code is not UUID format', async () => {
    const errors = await getErrors('not-a-uuid');
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('code');
  });

  it('should fail if code is an empty string', async () => {
    const errors = await getErrors('');
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail if code is missing', async () => {
    const errors = await getErrors(undefined);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('code');
  });

  it('should fail if code is a number', async () => {
    const errors = await getErrors(12345);
    expect(errors.length).toBeGreaterThan(0);
  });
});
