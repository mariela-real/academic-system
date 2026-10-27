import { describe, expect, it, vi } from 'vitest';
import { UserRole } from '../../../auth/domain/entity/user-role.js';
import { EnrollmentsRepository } from '../../../enrollments/data/repository/enrollments.repository.js';
import { EnrollmentStatus } from '../../../enrollments/domain/entity/enrollment-status.js';
import { GradesRepository } from '../../../grades/data/repository/grades.repository.js';
import { StudentsRepository } from '../../../students/data/repository/students.repository.js';
import { EnrollmentBuilder } from '../../../../../test/builders/enrollment.builder.js';
import { StudentBuilder } from '../../../../../test/builders/student.builder.js';
import { AcademicHistoryService } from './academic-history.service.js';

describe('Academic history', () => {
  it('retains cancelled enrollments and their current grade state', async () => {
    // arrange
    const student = new StudentBuilder().build();
    const enrollment = new EnrollmentBuilder()
      .withStatus(EnrollmentStatus.CANCELLED)
      .build();
    const enrollmentsRepository: Pick<
      EnrollmentsRepository,
      'getByStudentId' | 'getByStudentAndInstructorId'
    > = {
      getByStudentId: vi.fn().mockResolvedValue([enrollment]),
      getByStudentAndInstructorId: vi.fn(),
    };
    const gradesRepository: Pick<GradesRepository, 'getByEnrollmentIds'> = {
      getByEnrollmentIds: vi.fn().mockResolvedValue([]),
    };
    const studentsRepository: Pick<
      StudentsRepository,
      'findById' | 'findByUserId'
    > = {
      findById: vi.fn(),
      findByUserId: vi.fn().mockResolvedValue(student),
    };
    const academicHistoryService = new AcademicHistoryService(
      enrollmentsRepository,
      gradesRepository,
      studentsRepository,
    );

    // act
    const response = await academicHistoryService.getOwnHistory({
      id: student.userId,
      email: student.user.email,
      fullName: student.user.fullName,
      role: UserRole.STUDENT,
    });

    // assert
    expect(response.records).toHaveLength(1);
    expect(response.records[0]).toMatchObject({
      enrollmentId: enrollment.id,
      status: EnrollmentStatus.CANCELLED,
      grade: null,
    });
  });
});
