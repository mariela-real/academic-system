import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  isForeignKeyViolation,
  isUniqueConstraintViolation,
} from '../../../../data/repository/database-errors.js';
import { UsersRepository } from '../../../auth/data/repository/users.repository.js';
import type { AuthenticatedUser } from '../../../auth/domain/entity/authenticated-user.js';
import { UserRole } from '../../../auth/domain/entity/user-role.js';
import type { Student } from '../entity/student.entity.js';
import { StudentsRepository } from '../../data/repository/students.repository.js';
import { CreateStudentRequest } from '../../presentation/request/create-student.request.js';
import { UpdateStudentRequest } from '../../presentation/request/update-student.request.js';
import type { StudentResponse } from '../../presentation/response/student.response.js';

@Injectable()
export class StudentsService {
  constructor(
    @Inject(StudentsRepository)
    private readonly studentsRepository: Pick<
      StudentsRepository,
      'findAll' | 'findById' | 'findByUserId' | 'create' | 'update' | 'delete'
    >,
    @Inject(UsersRepository)
    private readonly usersRepository: Pick<UsersRepository, 'findById'>,
  ) {}

  async getAll(): Promise<StudentResponse[]> {
    const students = await this.studentsRepository.findAll();

    return students.map((student) => this.toResponse(student));
  }

  async getById(
    id: string,
    requester: AuthenticatedUser,
  ): Promise<StudentResponse> {
    const student = await this.getStudent(id);

    if (
      requester.role === UserRole.STUDENT &&
      student.userId !== requester.id
    ) {
      throw new ForbiddenException('No puedes consultar otro perfil.');
    }

    return this.toResponse(student);
  }

  async create(request: CreateStudentRequest): Promise<StudentResponse> {
    await this.validateStudentAccount(request.userId);

    try {
      const student = await this.studentsRepository.create({
        userId: request.userId,
        studentNumber: request.studentNumber.trim(),
      });

      const createdStudent = await this.getStudent(student.id);

      return this.toResponse(createdStudent);
    } catch (error) {
      if (isUniqueConstraintViolation(error)) {
        throw new ConflictException(
          'El usuario o número institucional ya está asociado a un estudiante.',
        );
      }

      throw error;
    }
  }

  async update(
    id: string,
    request: UpdateStudentRequest,
  ): Promise<StudentResponse> {
    const values = this.toUpdateValues(request);
    await this.validateStudentAccount(values.userId);

    let updatedStudent: Student | null;

    try {
      updatedStudent = await this.studentsRepository.update(id, values);
    } catch (error) {
      if (isUniqueConstraintViolation(error)) {
        throw new ConflictException(
          'El usuario o número institucional ya está asociado a un estudiante.',
        );
      }

      throw error;
    }

    if (updatedStudent === null) {
      throw new NotFoundException('No se encontró el estudiante.');
    }

    return this.toResponse(updatedStudent);
  }

  async delete(id: string): Promise<void> {
    try {
      const deleted = await this.studentsRepository.delete(id);

      if (deleted === false) {
        throw new NotFoundException('No se encontró el estudiante.');
      }
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new ConflictException(
          'No se puede eliminar un estudiante con inscripciones asociadas.',
        );
      }

      throw error;
    }
  }

  private async getStudent(id: string): Promise<Student> {
    const student = await this.studentsRepository.findById(id);

    if (student === null) {
      throw new NotFoundException('No se encontró el estudiante.');
    }

    return student;
  }

  private async validateStudentAccount(userId?: string): Promise<void> {
    if (userId === undefined) {
      return;
    }

    const user = await this.usersRepository.findById(userId);

    if (user === null || user.role !== UserRole.STUDENT) {
      throw new NotFoundException(
        'No se encontró la cuenta de estudiante indicada.',
      );
    }
  }

  private toUpdateValues(request: UpdateStudentRequest): Partial<Student> {
    const values: Partial<Student> = {};

    if (request.userId !== undefined) {
      values.userId = request.userId;
    }

    if (request.studentNumber !== undefined) {
      values.studentNumber = request.studentNumber.trim();
    }

    if (Object.keys(values).length === 0) {
      throw new BadRequestException('Debes indicar al menos un campo.');
    }

    return values;
  }

  private toResponse(student: Student): StudentResponse {
    return {
      id: student.id,
      userId: student.userId,
      studentNumber: student.studentNumber,
      fullName: student.user.fullName,
      email: student.user.email,
    };
  }
}
