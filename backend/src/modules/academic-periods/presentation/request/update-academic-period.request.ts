import {
  IsBoolean,
  IsDateString,
  IsOptional,
  Matches,
} from 'class-validator';

const DATE_TIME_WITH_OFFSET =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

export class UpdateAcademicPeriodRequest {
  @IsOptional()
  @IsDateString()
  @Matches(DATE_TIME_WITH_OFFSET)
  enrollmentStartsAt?: string;

  @IsOptional()
  @IsDateString()
  @Matches(DATE_TIME_WITH_OFFSET)
  enrollmentEndsAt?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
