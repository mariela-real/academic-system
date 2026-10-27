import { describe, expect, it, vi } from 'vitest';
import { UserRole } from '../../../auth/domain/entity/user-role.js';
import { StudentsRepository } from '../../../students/data/repository/students.repository.js';
import { GradeBuilder } from '../../../../../test/builders/grade.builder.js';
import { GradesRepository } from '../../data/repository/grades.repository.js';
import { GradesService } from './grades.service.js';

describe('Academic grades', () => {
  it('rejects grades outside the confirmed 0–100 scale', async () => {
    // arrange
    const gradesRepository: Pick<
      GradesRepository,
      'getAll' | 'getByEnrollmentId' | 'getByStudentId' | 'getByInstructorId' | 'set'
    > = {
      getAll: vi.fn(),
      getByEnrollmentId: vi.fn(),
      getByStudentId: vi.fn(),
      getByInstructorId: vi.fn(),
      set: vi.fn(),
    };
    const studentsRepository: Pick<StudentsRepository, 'findByUserId'> = {
      findByUserId: vi.fn(),
    };
    const gradesService = new GradesService(
      gradesRepository,
      studentsRepository,
    );

    // act
    const response = gradesService.set(
      '00000000-0000-4000-8000-000000000040',
      { value: 100.1 },
      {
        id: '00000000-0000-4000-8000-000000000050',
        email: 'teacher@example.test',
        fullName: 'Test Teacher',
        role: UserRole.TEACHER,
      },
    );

    // assert
    await expect(response).rejects.toThrow(
      'La calificación debe estar entre 0 y 100.',
    );
    expect(gradesRepository.set).not.toHaveBeenCalled();
  });

  it("prevents a student from reading another student's grade", async () => {
    // arrange
    const grade = new GradeBuilder().build();
    const gradesRepository: Pick<
      GradesRepository,
      'getAll' | 'getByEnrollmentId' | 'getByStudentId' | 'getByInstructorId' | 'set'
    > = {
      getAll: vi.fn(),
      getByEnrollmentId: vi.fn().mockResolvedValue(grade),
      getByStudentId: vi.fn(),
      getByInstructorId: vi.fn(),
      set: vi.fn(),
    };
    const studentsRepository: Pick<StudentsRepository, 'findByUserId'> = {
      findByUserId: vi.fn(),
    };
    const gradesService = new GradesService(
      gradesRepository,
      studentsRepository,
    );

    // act
    const response = gradesService.getByEnrollmentId(
      grade.enrollmentId,
      {
        id: '00000000-0000-4000-8000-000000000070',
        email: 'other.student@example.test',
        fullName: 'Other Student',
        role: UserRole.STUDENT,
      },
    );

    // assert
    await expect(response).rejects.toThrow(
      'No tienes permiso para consultar esta calificación.',
    );
  });
});
