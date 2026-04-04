import { CreateUserDto } from '../../src/modules/user-account/dto/create-user.dto';

export class UserTestDtoManager {
  createUserDto({
    login,
    email,
    pass,
  }: {
    login?: string;
    email?: string;
    pass?: string;
  }): CreateUserDto {
    return {
      login: login ?? 'test_login',
      email: email ?? 'test_email@gmail.com',
      password: pass ?? 'test_password',
    };
  }

  createUsersListDto(count: number): CreateUserDto[] {
    const users: CreateUserDto[] = [];

    for (let i = 0; i <= count; i++) {
      users.push({
        login: 'test' + i,
        email: `test${i}@gmail.com`,
        password: 'test',
      });
    }
    return users;
  }
}
