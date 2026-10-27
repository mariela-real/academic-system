import { IsNumber, Max, Min } from 'class-validator';

export class SetGradeRequest {
  @IsNumber()
  @Min(0)
  @Max(100)
  value: number;
}
