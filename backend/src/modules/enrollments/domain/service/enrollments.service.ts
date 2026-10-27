import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isUniqueConstraintViolation } from '../../../../data/repository/database-errors.js';
import type { AuthenticatedUser } from '../../../auth/domain/entity/authenticated-user.js';
import { UserRole } from '../../../auth/domain/entity/user-role.js';
import { StudentsRepository } from '../../../students/data/repository/students.repository.js';
import { Enrollment } from '../entity/enrollment.entity.js';
import { EnrollmentRuleError } from '../error/enrollment-rule.error.js';
import { EnrollmentsRepository } from '../../data/repository/enrollments.repository.js';
import { CreateEnrollmentRequest } from '../../presentation/request/create-enrollment.request.js';
import { CancelEnrollmentRequest } from '../../presentation/request/cancel-enrollment.request.js';
import type { EnrollmentResponse } from '../../presentation/response/enrollment.response.js';

@Injectable()
export class EnrollmentsService {
  constructor(
    @Inject(EnrollmentsRepository)
    private readonly enrollmentsRepository: Pick<
      EnrollmentsRepository,
      'getAll' | 'getById' | 'getByStudentId' | 'getByInstructorId' | 'createOrReactivate' | 'cancel'
    >,
    @Inject(StudentsRepository)
    private readonly studentsRepository: Pick<StudentsRepository, 'findByUserId'>,
  ) {}

  async getAll(requester: AuthenticatedUser): Promise<EnrollmentResponse[]> {
    const enrollments = await this.getEnrollmentsFor(requester);

    return enrollments.map((enrollment) => this.toResponse(enrollment));
  }

  async getById(
    id: string,
    requester: AuthenticatedUser,
  ): Promise<EnrollmentResponse> {
    const enrollment = await this.enrollmentsRepository.getById(id);

    if (enrollment === null) {
      throw new NotFoundException('No se encontró la inscripción.');
    }

    this.validateReadAccess(enrollment, requester);

    return this.toResponse(enrollment);
  }

  async create(
    request: CreateEnrollmentRequest,
    requester: AuthenticatedUser,
  ): Promise<EnrollmentResponse> {
    const studentId = await this.getTargetStudentId(request, requester);
    const isAdministrator = requester.role === UserRole.ADMIN;
    const reason = isAdministrator ? request.reason?.trim() : undefined;

    try {
      const operation = await this.enrollmentsRepository.createOrReactivate(
        {
          studentId,
          courseId: request.courseId,
          actorUserId: requester.id,
          requesterRole: requester.role,
          reason,
        },
      );

      return this.toResponse(operation.enrollment);
    } catch (error) {
      this.throwEnrollmentError(error);
    }
  }

  async cancel(
    id: string,
    request: CancelEnrollmentRequest,
    requester: AuthenticatedUser,
  ): Promise<EnrollmentResponse> {
    const isAdministrator = requester.role === UserRole.ADMIN;

    try {
      const enrollment = await this.enrollmentsRepository.cancel(
        {
          id,
          actorUserId: requester.id,
          requesterUserId: requester.id,
          requesterRole: requester.role,
          reason: isAdministrator ? request.reason?.trim() : undefined,
        },
      );

      return this.toResponse(enrollment);
    } catch (error) {
      this.throwEnrollmentError(error);
    }
  }

  private async getEnrollmentsFor(
    requester: AuthenticatedUser,
  ): Promise<Enrollment[]> {
    if (requester.role === UserRole.ADMIN) {
      return this.enrollmentsRepository.getAll();
    }

    if (requester.role === UserRole.TEACHER) {
      return this.enrollmentsRepository.getByInstructorId(requester.id);
    }

    const student = await this.studentsRepository.findByUserId(requester.id);

    if (student === null) {
      throw new NotFoundException('No se encontró el perfil de estudiante.');
    }

    return this.enrollmentsRepository.getByStudentId(student.id);
  }

  private async getTargetStudentId(
    request: CreateEnrollmentRequest,
    requester: AuthenticatedUser,
  ): Promise<string> {
    if (requester.role === UserRole.ADMIN) {
      if (request.studentId === undefined) {
        throw new BadRequestException(
          'El administrador debe indicar el estudiante.',
        );
      }

      return request.studentId;
    }

    if (request.studentId !== undefined) {
      throw new ForbiddenException(
        'El estudiante no puede seleccionar otra cuenta.',
      );
    }

    const student = await this.studentsRepository.findByUserId(requester.id);

    if (student === null) {
      throw new NotFoundException('No se encontró el perfil de estudiante.');
    }

    return student.id;
  }

  private validateReadAccess(
    enrollment: Enrollment,
    requester: AuthenticatedUser,
  ): void {
    const canRead =
      requester.role === UserRole.ADMIN ||
      (requester.role === UserRole.STUDENT &&
        enrollment.student.userId === requester.id) ||
      (requester.role === UserRole.TEACHER &&
        enrollment.course.instructorId === requester.id);

    if (canRead === false) {
      throw new ForbiddenException(
        'No tienes permiso para consultar esta inscripción.',
      );
    }
  }

  private toResponse(enrollment: Enrollment): EnrollmentResponse {
    return {
      id: enrollment.id,
      status: enrollment.status,
      createdAt: enrollment.createdAt,
      student: {
        id: enrollment.student.id,
        studentNumber: enrollment.student.studentNumber,
        fullName: enrollment.student.user.fullName,
      },
      course: {
        id: enrollment.course.id,
        subjectCode: enrollment.course.subject.code,
        subjectName: enrollment.course.subject.name,
        academicPeriod: enrollment.course.academicPeriod,
      },
    };
  }

  private throwEnrollmentError(error: unknown): never {
    if (isUniqueConstraintViolation(error)) {
      throw new ConflictException(
        'El estudiante ya tiene una inscripción para este curso.',
      );
    }

    if (error instanceof EnrollmentRuleError === false) {
      throw error;
    }

    switch (error.failure) {
      case 'course-not-found':
        throw new NotFoundException('No se encontró el curso.');
      case 'student-not-found':
        throw new NotFoundException('No se encontró el estudiante.');
      case 'period-not-found':
        throw new NotFoundException('No se encontró la gestión académica.');
      case 'period-disabled':
        throw new ConflictException('La gestión académica está deshabilitada.');
      case 'window-closed':
        throw new ConflictException(
          'El periodo de inscripción está cerrado para estudiantes.',
        );
      case 'reason-required':
        throw new BadRequestException(
          'El administrador debe justificar la excepción.',
        );
      case 'capacity-full':
        throw new ConflictException('El curso no tiene cupos disponibles.');
      case 'already-active':
        throw new ConflictException(
          'El estudiante ya tiene una inscripción activa en este curso.',
        );
      case 'enrollment-not-found':
        throw new NotFoundException('No se encontró la inscripción.');
      case 'enrollment-not-active':
        throw new ConflictException('La inscripción ya está cancelada.');
      case 'not-owner':
        throw new ForbiddenException(
          'Solo puedes cancelar tu propia inscripción.',
        );
    }
  }
}
