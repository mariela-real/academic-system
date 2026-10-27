import { IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class CreateSubjectRequest {
  @IsString()
  @Length(1, 50)
  code: string;

  @IsString()
  @Length(1, 150)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
