import { IsNumber, IsString } from 'class-validator';
import { AuthToken } from '../interfaces/auth.token';
import { Type } from 'class-transformer';

export class AuthDTO {
  @IsString()
  AUTH_ID: string;

  @Type(() => Number)
  @IsNumber()
  AUTH_EXPIRES: number;

  @IsString()
  REFRESH_ID: string;

  @IsString()
  member_id: string;

  toAuthToken(): AuthToken {
    return {
      accessToken: this.AUTH_ID,
      expiresIn: this.AUTH_EXPIRES,
      refreshToken: this.REFRESH_ID,
      memberId: this.member_id,
    };
  }
}
