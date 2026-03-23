export interface RefreshTokenDto {
  publicId: string;
  deviceId: string;
  iat: number;
  exp: number;
}
