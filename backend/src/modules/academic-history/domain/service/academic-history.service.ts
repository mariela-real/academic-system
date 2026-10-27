import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../../../auth/domain/entity/authenticated-user.js';
import { UserRole } from '../../../auth/domain/entity/user-role.js';
import { EnrollmentsRepository } from '../../../enrollments/data/repository/enrollments.repository.js';
import { Enrollment } from '../../../enrollments/domain/entity/enrollment.entity.js';
import { GradesRepository } from '../../../grades/data/repository/grades.repository.js';
import { StudentsRepository } from '../../../students/data/repository/students.repository.js';
import type { AcademicHistoryResponse } from '../../presentation/response/academic-history.response.js';

@Injectable()
export class AcademicHistoryService {
  constructor(
    @Inject(EnrollmentsRepository)
    private readonly enrollmentsRepository: Pick<
      EnrollmentsRepository,
      'getByStudentId' | 'getByStudentAndInstructorId'
    >,
    @Inject(GradesRepository)
    private readonly gradesRepository: Pick<
      GradesRepository,
      'getByEnrollmentIds'
    >,
    @Inject(StudentsRepository)
    private readonly studentsRepository: Pick<
      StudentsRepository,
      'findById' | 'findByUserId'
    >,
  ) {}

  async getOwnHistory(
    requester: AuthenticatedUser,
  ): Promise<AcademicHistoryResponse> {
    if (requester.role !== UserRole.STUDENT) {
      throw new ForbiddenException(
        'Solo estudiantes pueden consultar su propio historial.',
      );
    }

    const student = await this.studentsRepository.findByUserId(requester.id);

    if (student === null) {
      throw new NotFoundException('No se encontró el perfil de estudiante.');
    }

    const enrollments =
      await this.enrollmentsRepository.getByStudentId(student.id);

    return this.toResponse(student, enrollments);
  }

  async getStudentHistory(
    studentId: string,
    requester: AuthenticatedUser,
  ): Promise<AcademicHistoryResponse> {
    const student = await this.studentsRepository.findById(studentId);

    if (student === null) {
      throw new NotFoundException('No se encontró el perfil de estudiante.');
    }

    const enrollments =
      requester.role === UserRole.ADMIN
        ? await this.enrollmentsRepository.getByStudentId(student.id)
        : await this.getTeacherEnrollments(student.id, requester);

    return this.toResponse(student, enrollments);
  }

  private async getTeacherEnrollments(
    studentId: string,
    requester: AuthenticatedUser,
  ): Promise<Enrollment[]> {
    if (requester.role !== UserRole.TEACHER) {
      throw new ForbiddenException(
        'Solo administradores y docentes pueden consultar este historial.',
      );
    }

    return this.enrollmentsRepository.getByStudentAndInstructorId(
      studentId,
      requester.id,
    );
  }

  private async toResponse(
    student: NonNullable<Awaited<ReturnType<StudentsRepository['findById']>>>,
    enrollments: Enrollment[],
  ): Promise<AcademicHistoryResponse> {
    const grades = await this.gradesRepository.getByEnrollmentIds(
      enrollments.map((enrollment) => enrollment.id),
    );
    const gradesByEnrollmentId = new Map(
      grades.map((grade) => [grade.enrollmentId, grade]),
    );

    return {
      student: {
        id: student.id,
        studentNumber: student.studentNumber,
        fullName: student.user.fullName,
      },
      records: enrollments.map((enrollment) => {
        const grade = gradesByEnrollmentId.get(enrollment.id);

        return {
          enrollmentId: enrollment.id,
          status: enrollment.status,
          enrolledAt: enrollment.createdAt,
          course: {
            id: enrollment.course.id,
            subjectCode: enrollment.course.subject.code,
            subjectName: enrollment.course.subject.name,
            academicPeriod: enrollment.course.academicPeriod,
          },
          grade:
            grade === undefined
              ? null
              : { value: grade.value, updatedAt: grade.updatedAt },
        };
      }),
    };
  }
}
