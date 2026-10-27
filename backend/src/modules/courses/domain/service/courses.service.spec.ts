import { describe, expect, it, vi } from 'vitest';
import { UsersRepository } from '../../../auth/data/repository/users.repository.js';
import { UserRole } from '../../../auth/domain/entity/user-role.js';
import { AcademicPeriodsService } from '../../../academic-periods/domain/service/academic-periods.service.js';
import { SubjectsService } from '../../../subjects/domain/service/subjects.service.js';
import { CourseBuilder } from '../../../../../test/builders/course.builder.js';
import { UserBuilder } from '../../../../../test/builders/user.builder.js';
import { CoursesRepository } from '../../data/repository/courses.repository.js';
import { CoursesService } from './courses.service.js';

describe('Course catalog', () => {
  it('normalizes the academic period when creating a course', async () => {
    // arrange
    const savedCourse = new CourseBuilder()
      .withAcademicPeriod('2026-1')
      .build();
    const coursesRepository: Pick<
      CoursesRepository,
      'findAll' | 'findById' | 'create' | 'update' | 'delete'
    > = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(savedCourse),
      create: vi.fn().mockResolvedValue(savedCourse),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const subjectsService: Pick<SubjectsService, 'getById'> = {
      getById: vi.fn().mockResolvedValue(savedCourse.subject),
    };
    const academicPeriodsService: Pick<
      AcademicPeriodsService,
      'getEnabledByCode'
    > = {
      getEnabledByCode: vi.fn().mockResolvedValue({
        code: '2026-1',
        enabled: true,
        enrollmentStartsAt: new Date('2026-01-01T00:00:00.000Z'),
        enrollmentEndsAt: new Date('2026-06-30T23:59:59.000Z'),
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      }),
    };
    const usersRepository: Pick<UsersRepository, 'findById'> = {
      findById: vi.fn(),
    };
    const coursesService = new CoursesService(
      coursesRepository,
      subjectsService,
      academicPeriodsService,
      usersRepository,
    );

    // act
    const response = await coursesService.create({
      subjectId: savedCourse.subjectId,
      academicPeriod: ' 2026-1 ',
      capacity: 30,
    }, {
      id: '258a3bcf-796f-4472-a379-fab66fb47b06',
      email: 'admin@example.test',
      fullName: 'Test Admin',
      role: UserRole.ADMIN,
    });

    // assert
    expect(response.academicPeriod).toBe('2026-1');
    expect(coursesRepository.create).toHaveBeenCalledWith({
        subjectId: savedCourse.subjectId,
        academicPeriod: '2026-1',
        capacity: 30,
        instructorId: null,
      },
      '258a3bcf-796f-4472-a379-fab66fb47b06',
    );
  });

  it('does not assign a student account as a course instructor', async () => {
    // arrange
    const savedCourse = new CourseBuilder().withInstructor().build();
    const studentAccount = new UserBuilder()
      .withRole(UserRole.STUDENT)
      .build();
    const coursesRepository: Pick<
      CoursesRepository,
      'findAll' | 'findById' | 'create' | 'update' | 'delete'
    > = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const subjectsService: Pick<SubjectsService, 'getById'> = {
      getById: vi.fn().mockResolvedValue(savedCourse.subject),
    };
    const academicPeriodsService: Pick<
      AcademicPeriodsService,
      'getEnabledByCode'
    > = {
      getEnabledByCode: vi.fn().mockResolvedValue({
        code: '2026-1',
        enabled: true,
        enrollmentStartsAt: new Date('2026-01-01T00:00:00.000Z'),
        enrollmentEndsAt: new Date('2026-06-30T23:59:59.000Z'),
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      }),
    };
    const usersRepository: Pick<UsersRepository, 'findById'> = {
      findById: vi.fn().mockResolvedValue(studentAccount),
    };
    const coursesService = new CoursesService(
      coursesRepository,
      subjectsService,
      academicPeriodsService,
      usersRepository,
    );

    // act
    const response = coursesService.create({
      subjectId: savedCourse.subjectId,
      academicPeriod: '2026-1',
      capacity: 30,
      instructorId: savedCourse.instructorId ?? undefined,
    }, {
      id: '258a3bcf-796f-4472-a379-fab66fb47b06',
      email: 'admin@example.test',
      fullName: 'Test Admin',
      role: UserRole.ADMIN,
    });

    // assert
    await expect(response).rejects.toThrow('No se encontró el docente indicado.');
  });
});
