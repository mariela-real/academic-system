import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  isForeignKeyViolation,
  isUniqueConstraintViolation,
} from '../../../../data/repository/database-errors.js';
import { SubjectsRepository } from '../../data/repository/subjects.repository.js';
import { Subject } from '../entity/subject.entity.js';
import { CreateSubjectRequest } from '../../presentation/request/create-subject.request.js';
import { UpdateSubjectRequest } from '../../presentation/request/update-subject.request.js';

@Injectable()
export class SubjectsService {
  constructor(
    @Inject(SubjectsRepository)
    private readonly subjectsRepository: Pick<
      SubjectsRepository,
      'findAll' | 'findById' | 'create' | 'update' | 'delete'
    >,
  ) {}

  getAll(): Promise<Subject[]> {
    return this.subjectsRepository.findAll();
  }

  async getById(id: string): Promise<Subject> {
    const subject = await this.subjectsRepository.findById(id);

    if (subject === null) {
      throw new NotFoundException('No se encontró la materia.');
    }

    return subject;
  }

  async create(request: CreateSubjectRequest): Promise<Subject> {
    try {
      return await this.subjectsRepository.create({
        code: request.code.trim().toUpperCase(),
        name: request.name.trim(),
        description: request.description?.trim() || null,
      });
    } catch (error) {
      if (isUniqueConstraintViolation(error)) {
        throw new ConflictException('Ya existe una materia con ese código.');
      }

      throw error;
    }
  }

  async update(
    id: string,
    request: UpdateSubjectRequest,
  ): Promise<Subject> {
    const values = this.toUpdateValues(request);
    let subject: Subject | null;

    try {
      subject = await this.subjectsRepository.update(id, values);
    } catch (error) {
      if (isUniqueConstraintViolation(error)) {
        throw new ConflictException('Ya existe una materia con ese código.');
      }

      throw error;
    }

    if (subject === null) {
      throw new NotFoundException('No se encontró la materia.');
    }

    return subject;
  }

  async delete(id: string): Promise<void> {
    try {
      const deleted = await this.subjectsRepository.delete(id);

      if (deleted === false) {
        throw new NotFoundException('No se encontró la materia.');
      }
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new ConflictException(
          'No se puede eliminar una materia asociada a cursos.',
        );
      }

      throw error;
    }
  }

  private toUpdateValues(request: UpdateSubjectRequest): Partial<Subject> {
    const values: Partial<Subject> = {};

    if (request.code !== undefined) {
      values.code = request.code.trim().toUpperCase();
    }

    if (request.name !== undefined) {
      values.name = request.name.trim();
    }

    if (request.description !== undefined) {
      values.description = request.description.trim() || null;
    }

    if (Object.keys(values).length === 0) {
      throw new BadRequestException('Debes indicar al menos un campo.');
    }

    return values;
  }
}
