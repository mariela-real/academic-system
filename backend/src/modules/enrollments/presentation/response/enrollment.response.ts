import type { EnrollmentStatus } from '../../domain/entity/enrollment-status.js';

export type EnrollmentResponse = {
  id: string;
  status: EnrollmentStatus;
  createdAt: Date;
  student: {
    id: string;
    studentNumber: string;
    fullName: string;
  };
  course: {
    id: string;
    subjectCode: string;
    subjectName: string;
    academicPeriod: string;
  };
};
