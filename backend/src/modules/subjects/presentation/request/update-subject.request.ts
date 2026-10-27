import { IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class UpdateSubjectRequest {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  code?: string;

  @IsOptional()
  @IsString()
  @Length(1, 150)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
