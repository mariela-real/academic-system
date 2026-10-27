import type { EnrollmentStatus } from '../../../enrollments/domain/entity/enrollment-status.js';

export type AcademicHistoryResponse = {
  student: {
    id: string;
    studentNumber: string;
    fullName: string;
  };
  records: Array<{
    enrollmentId: string;
    status: EnrollmentStatus;
    enrolledAt: Date;
    course: {
      id: string;
      subjectCode: string;
      subjectName: string;
      academicPeriod: string;
    };
    grade: {
      value: number;
      updatedAt: Date;
    } | null;
  }>;
};
