import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreatePostInputDto } from '../../../src/modules/posts/api/input-dto';

const getErrorFields = async (dto: object): Promise<string[]> => {
  const instance = plainToInstance(CreatePostInputDto, dto);
  const errors = await validate(instance);
  return errors.map((e) => e.property);
};

describe('CreatePostInputDto', () => {
  it('should pass with valid uploadIds only', async () => {
    const errors = await getErrorFields({ uploadIds: ['id1'] });
    expect(errors).toHaveLength(0);
  });

  it('should pass with uploadIds and description', async () => {
    const errors = await getErrorFields({ uploadIds: ['id1', 'id2'], description: 'My post' });
    expect(errors).toHaveLength(0);
  });

  it('should pass without description (optional field)', async () => {
    const errors = await getErrorFields({ uploadIds: ['id1'] });
    expect(errors).not.toContain('description');
  });

  it('should fail if uploadIds is missing', async () => {
    const errors = await getErrorFields({});
    expect(errors).toContain('uploadIds');
  });

  it('should fail if uploadIds is empty array', async () => {
    const errors = await getErrorFields({ uploadIds: [] });
    expect(errors).toContain('uploadIds');
  });

  it('should fail if uploadIds contains non-string values', async () => {
    const errors = await getErrorFields({ uploadIds: [1, 2, 3] });
    expect(errors).toContain('uploadIds');
  });

  it('should fail if description exceeds 500 chars', async () => {
    const errors = await getErrorFields({
      uploadIds: ['id1'],
      description: 'a'.repeat(501),
    });
    expect(errors).toContain('description');
  });

  it('should pass if description is exactly 500 chars', async () => {
    const errors = await getErrorFields({
      uploadIds: ['id1'],
      description: 'a'.repeat(500),
    });
    expect(errors).toHaveLength(0);
  });
});
