import { describe, expect, it, vi } from 'vitest';
import { SubjectsRepository } from '../../data/repository/subjects.repository.js';
import { SubjectBuilder } from '../../../../../test/builders/subject.builder.js';
import { SubjectsService } from './subjects.service.js';

describe('Subject catalog', () => {
  it('normalizes catalog fields when creating a subject', async () => {
    // arrange
    const savedSubject = new SubjectBuilder()
      .withCode('MAT-101')
      .withName('Matemática')
      .withDescription('Materia académica')
      .build();
    const subjectsRepository: Pick<
      SubjectsRepository,
      'findAll' | 'findById' | 'create' | 'update' | 'delete'
    > = {
      findAll: vi.fn().mockResolvedValue([savedSubject]),
      findById: vi.fn(),
      create: vi.fn().mockResolvedValue(savedSubject),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const subjectsService = new SubjectsService(subjectsRepository);

    // act
    const response = await subjectsService.create({
      code: ' mat-101 ',
      name: ' Matemática ',
      description: ' Materia académica ',
    });

    // assert
    expect(response).toEqual(savedSubject);
    expect(subjectsRepository.create).toHaveBeenCalledWith({
      code: 'MAT-101',
      name: 'Matemática',
      description: 'Materia académica',
    });
  });

  it('reports a missing subject rather than returning an empty record', async () => {
    // arrange
    const subjectsRepository: Pick<
      SubjectsRepository,
      'findAll' | 'findById' | 'create' | 'update' | 'delete'
    > = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const subjectsService = new SubjectsService(subjectsRepository);

    // act
    const response = subjectsService.getById(
      '00000000-0000-4000-8000-000000000002',
    );

    // assert
    await expect(response).rejects.toThrow('No se encontró la materia.');
  });
});
