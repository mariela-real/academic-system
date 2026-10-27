import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class UpdateStudentRequest {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  @Length(1, 64)
  studentNumber?: string;
}
