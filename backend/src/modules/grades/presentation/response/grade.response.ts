import type { EnrollmentStatus } from '../../../enrollments/domain/entity/enrollment-status.js';

export type GradeResponse = {
  id: string;
  value: number;
  updatedAt: Date;
  recordedBy: {
    id: string;
    fullName: string;
  };
  enrollment: {
    id: string;
    status: EnrollmentStatus;
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
};
