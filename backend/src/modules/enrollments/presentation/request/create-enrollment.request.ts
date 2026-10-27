import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateEnrollmentRequest {
  @IsUUID()
  courseId: string;

  @IsOptional()
  @IsUUID()
  studentId?: string;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  reason?: string;
}
