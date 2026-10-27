import { describe, expect, it, vi } from 'vitest';
import { UserRole } from '../../../auth/domain/entity/user-role.js';
import { StudentsRepository } from '../../../students/data/repository/students.repository.js';
import { StudentBuilder } from '../../../../../test/builders/student.builder.js';
import { EnrollmentBuilder } from '../../../../../test/builders/enrollment.builder.js';
import { EnrollmentsRepository } from '../../data/repository/enrollments.repository.js';
import { EnrollmentsService } from './enrollments.service.js';

describe('Academic enrollments', () => {
  it('prevents students from selecting another student profile', async () => {
    // arrange
    const enrollmentsRepository: Pick<
      EnrollmentsRepository,
      | 'getAll'
      | 'getById'
      | 'getByStudentId'
      | 'getByInstructorId'
      | 'createOrReactivate'
      | 'cancel'
    > = {
      getAll: vi.fn(),
      getById: vi.fn(),
      getByStudentId: vi.fn(),
      getByInstructorId: vi.fn(),
      createOrReactivate: vi.fn(),
      cancel: vi.fn(),
    };
    const studentsRepository: Pick<StudentsRepository, 'findByUserId'> = {
      findByUserId: vi.fn(),
    };
    const enrollmentsService = new EnrollmentsService(
      enrollmentsRepository,
      studentsRepository,
    );

    // act
    const response = enrollmentsService.create(
      {
        courseId: '00000000-0000-4000-8000-000000000010',
        studentId: '00000000-0000-4000-8000-000000000020',
      },
      {
        id: '258a3bcf-796f-4472-a379-fab66fb47b06',
        email: 'student@example.test',
        fullName: 'Test Student',
        role: UserRole.STUDENT,
      },
    );

    // assert
    await expect(response).rejects.toThrow(
      'El estudiante no puede seleccionar otra cuenta.',
    );
    expect(enrollmentsRepository.createOrReactivate).not.toHaveBeenCalled();
  });

  it('limits teacher enrollment lists to their assigned courses', async () => {
    // arrange
    const enrollment = new EnrollmentBuilder().build();
    const enrollmentsRepository: Pick<
      EnrollmentsRepository,
      | 'getAll'
      | 'getById'
      | 'getByStudentId'
      | 'getByInstructorId'
      | 'createOrReactivate'
      | 'cancel'
    > = {
      getAll: vi.fn(),
      getById: vi.fn(),
      getByStudentId: vi.fn(),
      getByInstructorId: vi.fn().mockResolvedValue([enrollment]),
      createOrReactivate: vi.fn(),
      cancel: vi.fn(),
    };
    const studentsRepository: Pick<StudentsRepository, 'findByUserId'> = {
      findByUserId: vi.fn(),
    };
    const enrollmentsService = new EnrollmentsService(
      enrollmentsRepository,
      studentsRepository,
    );

    // act
    const response = await enrollmentsService.getAll({
      id: '00000000-0000-4000-8000-000000000050',
      email: 'teacher@example.test',
      fullName: 'Test Teacher',
      role: UserRole.TEACHER,
    });

    // assert
    expect(response).toHaveLength(1);
    expect(enrollmentsRepository.getByInstructorId).toHaveBeenCalledWith(
      '00000000-0000-4000-8000-000000000050',
    );
  });

  it('lets students review their full enrollment history', async () => {
    // arrange
    const enrollment = new EnrollmentBuilder().build();
    const student = new StudentBuilder().build();
    const enrollmentsRepository: Pick<
      EnrollmentsRepository,
      | 'getAll'
      | 'getById'
      | 'getByStudentId'
      | 'getByInstructorId'
      | 'createOrReactivate'
      | 'cancel'
    > = {
      getAll: vi.fn(),
      getById: vi.fn(),
      getByStudentId: vi.fn().mockResolvedValue([enrollment]),
      getByInstructorId: vi.fn(),
      createOrReactivate: vi.fn(),
      cancel: vi.fn(),
    };
    const studentsRepository: Pick<StudentsRepository, 'findByUserId'> = {
      findByUserId: vi.fn().mockResolvedValue(student),
    };
    const enrollmentsService = new EnrollmentsService(
      enrollmentsRepository,
      studentsRepository,
    );

    // act
    const response = await enrollmentsService.getAll({
      id: student.userId,
      email: student.user.email,
      fullName: student.user.fullName,
      role: UserRole.STUDENT,
    });

    // assert
    expect(response).toHaveLength(1);
    expect(enrollmentsRepository.getByStudentId).toHaveBeenCalledWith(
      student.id,
    );
  });
});
