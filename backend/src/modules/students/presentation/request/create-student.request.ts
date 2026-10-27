import { IsString, IsUUID, Length } from 'class-validator';

export class CreateStudentRequest {
  @IsUUID()
  userId: string;

  @IsString()
  @Length(1, 64)
  studentNumber: string;
}
