export class ProfileEntityDto {
  userId: number;
  firstName: string;
  lastName: string;
  birthday?: Date;
  countryId?: string;
  cityId?: string;
  aboutMe?: string;
}
