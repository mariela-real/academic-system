import { describe, expect, it, vi } from 'vitest';
import { UsersRepository } from '../../../auth/data/repository/users.repository.js';
import { UserRole } from '../../../auth/domain/entity/user-role.js';
import { StudentBuilder } from '../../../../../test/builders/student.builder.js';
import { StudentsRepository } from '../../data/repository/students.repository.js';
import { StudentsService } from './students.service.js';

describe('Student academic profiles', () => {
  it('allows students to read their own profile', async () => {
    // arrange
    const student = new StudentBuilder().build();
    const studentsRepository: Pick<
      StudentsRepository,
      'findAll' | 'findById' | 'findByUserId' | 'create' | 'update' | 'delete'
    > = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(student),
      findByUserId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const usersRepository: Pick<UsersRepository, 'findById'> = {
      findById: vi.fn(),
    };
    const studentsService = new StudentsService(
      studentsRepository,
      usersRepository,
    );

    // act
    const response = await studentsService.getById(student.id, {
      id: student.userId,
      email: student.user.email,
      fullName: student.user.fullName,
      role: UserRole.STUDENT,
    });

    // assert
    expect(response).toEqual({
      id: student.id,
      userId: student.userId,
      studentNumber: student.studentNumber,
      fullName: student.user.fullName,
      email: student.user.email,
    });
  });

  it('prevents students from reading another profile', async () => {
    // arrange
    const student = new StudentBuilder().build();
    const studentsRepository: Pick<
      StudentsRepository,
      'findAll' | 'findById' | 'findByUserId' | 'create' | 'update' | 'delete'
    > = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(student),
      findByUserId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const usersRepository: Pick<UsersRepository, 'findById'> = {
      findById: vi.fn(),
    };
    const studentsService = new StudentsService(
      studentsRepository,
      usersRepository,
    );

    // act
    const response = studentsService.getById(student.id, {
      id: '00000000-0000-4000-8000-000000000030',
      email: 'other.student@example.test',
      fullName: 'Other Student',
      role: UserRole.STUDENT,
    });

    // assert
    await expect(response).rejects.toThrow(
      'No puedes consultar otro perfil.',
    );
  });
});
