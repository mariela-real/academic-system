import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  isForeignKeyViolation,
} from '../../../../data/repository/database-errors.js';
import { UsersRepository } from '../../../auth/data/repository/users.repository.js';
import { UserRole } from '../../../auth/domain/entity/user-role.js';
import { SubjectsService } from '../../../subjects/domain/service/subjects.service.js';
import { AcademicPeriodsService } from '../../../academic-periods/domain/service/academic-periods.service.js';
import { AcademicPeriodUnavailableError } from '../../../academic-periods/domain/error/academic-period-unavailable.error.js';
import { CoursesRepository } from '../../data/repository/courses.repository.js';
import { Course } from '../entity/course.entity.js';
import { CourseCapacityLimitError } from '../error/course-capacity-limit.error.js';
import type { AuthenticatedUser } from '../../../auth/domain/entity/authenticated-user.js';
import { CreateCourseRequest } from '../../presentation/request/create-course.request.js';
import { UpdateCourseRequest } from '../../presentation/request/update-course.request.js';
import { CourseResponse } from '../../presentation/response/course.response.js';

@Injectable()
export class CoursesService {
  constructor(
    @Inject(CoursesRepository)
    private readonly coursesRepository: Pick<
      CoursesRepository,
      'findAll' | 'findById' | 'create' | 'update' | 'delete'
    >,
    @Inject(SubjectsService)
    private readonly subjectsService: Pick<SubjectsService, 'getById'>,
    @Inject(AcademicPeriodsService)
    private readonly academicPeriodsService: Pick<
      AcademicPeriodsService,
      'getEnabledByCode'
    >,
    @Inject(UsersRepository)
    private readonly usersRepository: Pick<UsersRepository, 'findById'>,
  ) {}

  async getAll(): Promise<CourseResponse[]> {
    const courses = await this.coursesRepository.findAll();

    return courses.map((course) => this.toResponse(course));
  }

  async getById(id: string): Promise<CourseResponse> {
    const course = await this.getCourse(id);

    return this.toResponse(course);
  }

  async create(
    request: CreateCourseRequest,
    actor: AuthenticatedUser,
  ): Promise<CourseResponse> {
    await this.subjectsService.getById(request.subjectId);
    await this.academicPeriodsService.getEnabledByCode(
      request.academicPeriod.trim(),
    );
    await this.validateInstructor(request.instructorId);

    let savedCourse: Course;

    try {
      savedCourse = await this.coursesRepository.create(
        {
          subjectId: request.subjectId,
          academicPeriod: request.academicPeriod.trim(),
          capacity: request.capacity,
          instructorId: request.instructorId ?? null,
        },
        actor.id,
      );
    } catch (error) {
      if (error instanceof AcademicPeriodUnavailableError) {
        throw new ConflictException(
          'La gestión académica está deshabilitada o no existe.',
        );
      }

      throw error;
    }

    return this.getById(savedCourse.id);
  }

  async update(
    id: string,
    request: UpdateCourseRequest,
    actor: AuthenticatedUser,
  ): Promise<CourseResponse> {
    const values = this.toUpdateValues(request);
    const currentCourse = await this.getCourse(id);
    await this.academicPeriodsService.getEnabledByCode(
      values.academicPeriod ?? currentCourse.academicPeriod,
    );
    await this.validateSubject(values.subjectId);
    await this.validateInstructor(values.instructorId);

    let updatedCourse: Course | null;

    try {
      updatedCourse = await this.coursesRepository.update(
        id,
        values,
        actor.id,
      );
    } catch (error) {
      if (error instanceof AcademicPeriodUnavailableError) {
        throw new ConflictException(
          'La gestión académica está deshabilitada o no existe.',
        );
      }

      if (error instanceof CourseCapacityLimitError) {
        throw new ConflictException(
          'El cupo no puede ser menor que las inscripciones activas.',
        );
      }

      if (isForeignKeyViolation(error)) {
        throw new ConflictException(
          'No se puede actualizar el curso por sus relaciones académicas.',
        );
      }

      throw error;
    }

    if (updatedCourse === null) {
      throw new NotFoundException('No se encontró el curso.');
    }

    return this.toResponse(updatedCourse);
  }

  async delete(id: string): Promise<void> {
    try {
      const deleted = await this.coursesRepository.delete(id);

      if (deleted === false) {
        throw new NotFoundException('No se encontró el curso.');
      }
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new ConflictException(
          'No se puede eliminar un curso con inscripciones asociadas.',
        );
      }

      throw error;
    }
  }

  private async getCourse(id: string): Promise<Course> {
    const course = await this.coursesRepository.findById(id);

    if (course === null) {
      throw new NotFoundException('No se encontró el curso.');
    }

    return course;
  }

  private async validateSubject(subjectId?: string): Promise<void> {
    if (subjectId !== undefined) {
      await this.subjectsService.getById(subjectId);
    }
  }

  private async validateInstructor(
    instructorId?: string | null,
  ): Promise<void> {
    if (instructorId === undefined || instructorId === null) {
      return;
    }

    const instructor = await this.usersRepository.findById(instructorId);

    if (instructor === null || instructor.role !== UserRole.TEACHER) {
      throw new NotFoundException('No se encontró el docente indicado.');
    }
  }

  private toUpdateValues(request: UpdateCourseRequest): Partial<Course> {
    const values: Partial<Course> = {};

    if (request.subjectId !== undefined) {
      values.subjectId = request.subjectId;
    }

    if (request.academicPeriod !== undefined) {
      values.academicPeriod = request.academicPeriod.trim();
    }

    if (request.capacity !== undefined) {
      values.capacity = request.capacity;
    }

    if (request.instructorId !== undefined) {
      values.instructorId = request.instructorId;
    }

    if (Object.keys(values).length === 0) {
      throw new BadRequestException('Debes indicar al menos un campo.');
    }

    return values;
  }

  private toResponse(course: Course): CourseResponse {
    return {
      id: course.id,
      subjectId: course.subjectId,
      subjectCode: course.subject.code,
      subjectName: course.subject.name,
      academicPeriod: course.academicPeriod,
      capacity: course.capacity,
      instructor:
        course.instructor === null
          ? null
          : {
              id: course.instructor.id,
              fullName: course.instructor.fullName,
            },
    };
  }
}
