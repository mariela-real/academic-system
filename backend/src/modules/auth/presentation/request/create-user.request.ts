import { IsEmail, IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '../../domain/entity/user-role.js';

export class CreateUserRequest {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  @MaxLength(160)
  fullName: string;

  @IsString()
  @MinLength(12)
  @MaxLength(72)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
}
