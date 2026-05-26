import { ProfileEntityDto } from './dto/profile.entity.dto';

export class ProfileEntity {
  id: number;
  publicId: string;
  userId: number;

  firstName: string;
  lastName: string;
  birthday: Date | null;
  countryId: string | null;
  cityId: string | null;
  aboutMe: string | null;

  static create(dto: ProfileEntityDto): ProfileEntity {
    const profile = new this();
    profile.userId = dto.userId;
    profile.firstName = dto.firstName;
    profile.lastName = dto.lastName;
    profile.birthday = null;
    profile.countryId = null;
    profile.cityId = null;
    profile.aboutMe = null;
    return profile;
  }

  static reconstruct(data: any): ProfileEntity {
    const profile = new this();
    profile.id = data.id;
    profile.publicId = data.publicId;
    profile.userId = data.userId;
    profile.firstName = data.firstName;
    profile.lastName = data.lastName;
    profile.birthday = data.birthday;
    profile.countryId = data.countryId;
    profile.cityId = data.cityId;
    profile.aboutMe = data.aboutMe;
    return profile;
  }
}
