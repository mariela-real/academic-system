import { describe, expect, it, vi } from 'vitest';
import { UserRole } from '../../../auth/domain/entity/user-role.js';
import { AcademicPeriodsRepository } from '../../data/repository/academic-periods.repository.js';
import { AcademicPeriodBuilder } from '../../../../../test/builders/academic-period.builder.js';
import { AcademicPeriodsService } from './academic-periods.service.js';

describe('Academic period configuration', () => {
  it('rejects a window whose closing date is not after its opening date', async () => {
    // arrange
    const academicPeriodsRepository: Pick<
      AcademicPeriodsRepository,
      'getAll' | 'getByCode' | 'create' | 'update'
    > = {
      getAll: vi.fn(),
      getByCode: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };
    const academicPeriodsService = new AcademicPeriodsService(
      academicPeriodsRepository,
    );

    // act
    const response = academicPeriodsService.create(
      {
        code: '2026-1',
        enrollmentStartsAt: '2026-06-01T00:00:00-04:00',
        enrollmentEndsAt: '2026-05-01T00:00:00-04:00',
        enabled: true,
      },
      {
        id: '258a3bcf-796f-4472-a379-fab66fb47b06',
        email: 'admin@example.test',
        fullName: 'Test Admin',
        role: UserRole.ADMIN,
      },
    );

    // assert
    await expect(response).rejects.toThrow(
      'El cierre de inscripciones debe ser posterior al inicio.',
    );
    expect(academicPeriodsRepository.create).not.toHaveBeenCalled();
  });

  it('records an enabled period using its explicit timezone offsets', async () => {
    // arrange
    const createdPeriod = new AcademicPeriodBuilder().build();
    const academicPeriodsRepository: Pick<
      AcademicPeriodsRepository,
      'getAll' | 'getByCode' | 'create' | 'update'
    > = {
      getAll: vi.fn(),
      getByCode: vi.fn(),
      create: vi.fn().mockResolvedValue(createdPeriod),
      update: vi.fn(),
    };
    const academicPeriodsService = new AcademicPeriodsService(
      academicPeriodsRepository,
    );

    // act
    const response = await academicPeriodsService.create(
      {
        code: ' 2026-1 ',
        enrollmentStartsAt: '2026-01-01T00:00:00-04:00',
        enrollmentEndsAt: '2026-06-30T00:00:00-04:00',
        enabled: true,
      },
      {
        id: '258a3bcf-796f-4472-a379-fab66fb47b06',
        email: 'admin@example.test',
        fullName: 'Test Admin',
        role: UserRole.ADMIN,
      },
    );

    // assert
    expect(response.code).toBe('2026-1');
    expect(academicPeriodsRepository.create).toHaveBeenCalledWith(
      {
        code: '2026-1',
        enrollmentStartsAt: new Date('2026-01-01T04:00:00.000Z'),
        enrollmentEndsAt: new Date('2026-06-30T04:00:00.000Z'),
        enabled: true,
      },
      '258a3bcf-796f-4472-a379-fab66fb47b06',
    );
  });
});
