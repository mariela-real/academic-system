import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from 'class-validator';

export class CreateCourseRequest {
  @IsUUID()
  subjectId: string;

  @IsString()
  @Length(1, 64)
  academicPeriod: string;

  @IsInt()
  @Min(1)
  capacity: number;

  @IsOptional()
  @IsUUID()
  instructorId?: string;
}
