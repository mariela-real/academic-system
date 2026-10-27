import {
  IsBoolean,
  IsDateString,
  IsString,
  Length,
  Matches,
} from 'class-validator';

const DATE_TIME_WITH_OFFSET =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

export class CreateAcademicPeriodRequest {
  @IsString()
  @Length(1, 64)
  code: string;

  @IsDateString()
  @Matches(DATE_TIME_WITH_OFFSET)
  enrollmentStartsAt: string;

  @IsDateString()
  @Matches(DATE_TIME_WITH_OFFSET)
  enrollmentEndsAt: string;

  @IsBoolean()
  enabled: boolean;
}
