import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { AcademicAuditLog } from '../../../../data/entity/academic-audit-log.entity.js';
import { AcademicPeriod } from '../../../../data/entity/academic-period.entity.js';
import { AcademicPeriodUnavailableError } from '../../../academic-periods/domain/error/academic-period-unavailable.error.js';
import { Course } from '../../domain/entity/course.entity.js';
import { CourseCapacityLimitError } from '../../domain/error/course-capacity-limit.error.js';

@Injectable()
export class CoursesRepository {
  constructor(
    @InjectRepository(Course)
    private readonly repository: Repository<Course>,
    private readonly dataSource: DataSource,
  ) {}

  findAll(): Promise<Course[]> {
    return this.repository.find({
      relations: { subject: true, instructor: true },
      order: { academicPeriod: 'DESC' },
    });
  }

  findById(id: string): Promise<Course | null> {
    return this.repository.findOne({
      where: { id },
      relations: { subject: true, instructor: true },
    });
  }

  create(course: Partial<Course>, actorUserId: string): Promise<Course> {
    return this.dataSource.transaction(async (manager) => {
      await this.getEnabledPeriod(manager, course.academicPeriod);
      const savedCourse = await manager.save(
        Course,
        manager.create(Course, course),
      );

      await manager.getRepository(AcademicAuditLog).save({
        actorUserId,
        action: 'course.created',
        resourceType: 'course',
        resourceId: savedCourse.id,
        reason: null,
        details: {
          academicPeriod: savedCourse.academicPeriod,
          capacity: savedCourse.capacity,
        },
      });

      return savedCourse;
    });
  }

  update(
    id: string,
    values: Partial<Course>,
    actorUserId: string,
  ): Promise<Course | null> {
    return this.dataSource.transaction(async (manager) => {
      const course = await manager.findOne(Course, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (course === null) {
        return null;
      }

      await this.getEnabledPeriod(
        manager,
        values.academicPeriod ?? course.academicPeriod,
      );

      const previousCapacity = course.capacity;
      const previousAcademicPeriod = course.academicPeriod;
      const nextCapacity = values.capacity ?? previousCapacity;
      const activeEnrollmentCount = await manager
        .createQueryBuilder()
        .select('COUNT(*)', 'count')
        .from('enrollments', 'enrollment')
        .where('enrollment.course_id = :courseId', { courseId: id })
        .andWhere('enrollment.status = :status', { status: 'active' })
        .getRawOne<{ count: string }>();

      if (nextCapacity < Number(activeEnrollmentCount?.count ?? 0)) {
        throw new CourseCapacityLimitError();
      }

      Object.assign(course, values);
      const savedCourse = await manager.save(course);

      if (savedCourse.academicPeriod !== previousAcademicPeriod) {
        await manager.getRepository(AcademicAuditLog).save({
          actorUserId,
          action: 'course.academic_period.changed',
          resourceType: 'course',
          resourceId: id,
          reason: null,
          details: {
            before: { academicPeriod: previousAcademicPeriod },
            after: { academicPeriod: savedCourse.academicPeriod },
          },
        });
      }

      if (nextCapacity !== previousCapacity) {
        await manager.getRepository(AcademicAuditLog).save({
          actorUserId,
          action: 'course.capacity.changed',
          resourceType: 'course',
          resourceId: id,
          reason: null,
          details: {
            before: { capacity: previousCapacity },
            after: { capacity: nextCapacity },
          },
        });
      }

      return this.getWithRelations(manager, savedCourse.id);
    });
  }

  private async getEnabledPeriod(
    manager: EntityManager,
    code?: string,
  ): Promise<void> {
    if (code === undefined) {
      throw new AcademicPeriodUnavailableError();
    }

    const period = await manager.findOne(AcademicPeriod, {
      where: { code },
      lock: { mode: 'pessimistic_read' },
    });

    if (period === null || period.enabled === false) {
      throw new AcademicPeriodUnavailableError();
    }
  }

  private getWithRelations(
    manager: EntityManager,
    id: string,
  ): Promise<Course | null> {
    return manager.findOne(Course, {
      where: { id },
      relations: { subject: true, instructor: true },
    });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete({ id });

    return (result.affected ?? 0) > 0;
  }
}
