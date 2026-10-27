import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../../../auth/domain/entity/authenticated-user.js';
import { UserRole } from '../../../auth/domain/entity/user-role.js';
import { StudentsRepository } from '../../../students/data/repository/students.repository.js';
import { Grade } from '../entity/grade.entity.js';
import { GradeRuleError } from '../error/grade-rule.error.js';
import { GradesRepository } from '../../data/repository/grades.repository.js';
import { SetGradeRequest } from '../../presentation/request/set-grade.request.js';
import type { GradeResponse } from '../../presentation/response/grade.response.js';

@Injectable()
export class GradesService {
  constructor(
    @Inject(GradesRepository)
    private readonly gradesRepository: Pick<
      GradesRepository,
      'getAll' | 'getByEnrollmentId' | 'getByStudentId' | 'getByInstructorId' | 'set'
    >,
    @Inject(StudentsRepository)
    private readonly studentsRepository: Pick<StudentsRepository, 'findByUserId'>,
  ) {}

  async getAll(requester: AuthenticatedUser): Promise<GradeResponse[]> {
    const grades = await this.getGradesFor(requester);

    return grades.map((grade) => this.toResponse(grade));
  }

  async getByEnrollmentId(
    enrollmentId: string,
    requester: AuthenticatedUser,
  ): Promise<GradeResponse> {
    const grade =
      await this.gradesRepository.getByEnrollmentId(enrollmentId);

    if (grade === null) {
      throw new NotFoundException('No se encontró la calificación.');
    }

    this.validateReadAccess(grade, requester);

    return this.toResponse(grade);
  }

  async set(
    enrollmentId: string,
    request: SetGradeRequest,
    instructor: AuthenticatedUser,
  ): Promise<GradeResponse> {
    this.validateGradeValue(request.value);

    try {
      const grade = await this.gradesRepository.set(
        enrollmentId,
        instructor.id,
        request.value,
      );

      return this.toResponse(grade);
    } catch (error) {
      this.throwGradeError(error);
    }
  }

  private async getGradesFor(
    requester: AuthenticatedUser,
  ): Promise<Grade[]> {
    if (requester.role === UserRole.ADMIN) {
      return this.gradesRepository.getAll();
    }

    if (requester.role === UserRole.TEACHER) {
      return this.gradesRepository.getByInstructorId(requester.id);
    }

    const student = await this.studentsRepository.findByUserId(requester.id);

    if (student === null) {
      throw new NotFoundException('No se encontró el perfil de estudiante.');
    }

    return this.gradesRepository.getByStudentId(student.id);
  }

  private validateReadAccess(
    grade: Grade,
    requester: AuthenticatedUser,
  ): void {
    const canRead =
      requester.role === UserRole.ADMIN ||
      (requester.role === UserRole.STUDENT &&
        grade.enrollment.student.userId === requester.id) ||
      (requester.role === UserRole.TEACHER &&
        grade.enrollment.course.instructorId === requester.id);

    if (canRead === false) {
      throw new ForbiddenException(
        'No tienes permiso para consultar esta calificación.',
      );
    }
  }

  private validateGradeValue(value: number): void {
    if (Number.isFinite(value) === false || value < 0 || value > 100) {
      throw new BadRequestException(
        'La calificación debe estar entre 0 y 100.',
      );
    }
  }

  private throwGradeError(error: unknown): never {
    if (error instanceof GradeRuleError === false) {
      throw error;
    }

    switch (error.failure) {
      case 'enrollment-not-found':
        throw new NotFoundException('No se encontró la inscripción.');
      case 'enrollment-not-active':
        throw new BadRequestException(
          'Solo se pueden calificar inscripciones activas.',
        );
      case 'instructor-not-assigned':
        throw new ForbiddenException(
          'Solo el docente asignado al curso puede registrar calificaciones.',
        );
    }
  }

  private toResponse(grade: Grade): GradeResponse {
    return {
      id: grade.id,
      value: grade.value,
      updatedAt: grade.updatedAt,
      recordedBy: {
        id: grade.instructor.id,
        fullName: grade.instructor.fullName,
      },
      enrollment: {
        id: grade.enrollment.id,
        status: grade.enrollment.status,
        student: {
          id: grade.enrollment.student.id,
          studentNumber: grade.enrollment.student.studentNumber,
          fullName: grade.enrollment.student.user.fullName,
        },
        course: {
          id: grade.enrollment.course.id,
          subjectCode: grade.enrollment.course.subject.code,
          subjectName: grade.enrollment.course.subject.name,
          academicPeriod: grade.enrollment.course.academicPeriod,
        },
      },
    };
  }
}
