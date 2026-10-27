import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from 'class-validator';

export class UpdateCourseRequest {
  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @IsOptional()
  @IsString()
  @Length(1, 64)
  academicPeriod?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsUUID()
  instructorId?: string | null;
}
