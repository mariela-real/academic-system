import { IsOptional, IsString, Length } from 'class-validator';

export class CancelEnrollmentRequest {
  @IsOptional()
  @IsString()
  @Length(1, 500)
  reason?: string;
}
