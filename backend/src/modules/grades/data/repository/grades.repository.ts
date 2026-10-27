import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { AcademicAuditLog } from '../../../../data/entity/academic-audit-log.entity.js';
import { Course } from '../../../courses/domain/entity/course.entity.js';
import { Enrollment } from '../../../enrollments/domain/entity/enrollment.entity.js';
import { EnrollmentStatus } from '../../../enrollments/domain/entity/enrollment-status.js';
import { GradeRuleError } from '../../domain/error/grade-rule.error.js';
import { Grade } from '../../domain/entity/grade.entity.js';

@Injectable()
export class GradesRepository {
  constructor(
    @InjectRepository(Grade)
    private readonly repository: Repository<Grade>,
    private readonly dataSource: DataSource,
  ) {}

  getAll(): Promise<Grade[]> {
    return this.repository.find({
      relations: {
        instructor: true,
        enrollment: {
          student: { user: true },
          course: { subject: true },
        },
      },
      order: { updatedAt: 'DESC' },
    });
  }

  getByEnrollmentId(enrollmentId: string): Promise<Grade | null> {
    return this.repository.findOne({
      where: { enrollmentId },
      relations: {
        instructor: true,
        enrollment: {
          student: { user: true },
          course: { subject: true },
        },
      },
    });
  }

  getByStudentId(studentId: string): Promise<Grade[]> {
    return this.repository.find({
      where: { enrollment: { studentId } },
      relations: {
        instructor: true,
        enrollment: {
          student: { user: true },
          course: { subject: true },
        },
      },
      order: { updatedAt: 'DESC' },
    });
  }

  getByInstructorId(instructorId: string): Promise<Grade[]> {
    return this.repository.find({
      where: { enrollment: { course: { instructorId } } },
      relations: {
        instructor: true,
        enrollment: {
          student: { user: true },
          course: { subject: true },
        },
      },
      order: { updatedAt: 'DESC' },
    });
  }

  getByEnrollmentIds(enrollmentIds: string[]): Promise<Grade[]> {
    if (enrollmentIds.length === 0) {
      return Promise.resolve([]);
    }

    return this.repository.find({
      where: { enrollmentId: In(enrollmentIds) },
    });
  }

  set(
    enrollmentId: string,
    instructorId: string,
    value: number,
  ): Promise<Grade> {
    return this.dataSource.transaction(async (manager) => {
      const enrollmentReference = await manager.findOne(Enrollment, {
        where: { id: enrollmentId },
      });

      if (enrollmentReference === null) {
        throw new GradeRuleError('enrollment-not-found');
      }

      const course = await manager.findOne(Course, {
        where: { id: enrollmentReference.courseId },
        lock: { mode: 'pessimistic_write' },
      });

      if (course === null || course.instructorId !== instructorId) {
        throw new GradeRuleError('instructor-not-assigned');
      }

      const enrollment = await manager.findOne(Enrollment, {
        where: { id: enrollmentId },
        lock: { mode: 'pessimistic_write' },
      });

      if (enrollment === null) {
        throw new GradeRuleError('enrollment-not-found');
      }

      if (enrollment.status !== EnrollmentStatus.ACTIVE) {
        throw new GradeRuleError('enrollment-not-active');
      }

      const existingGrade = await manager.findOne(Grade, {
        where: { enrollmentId },
        lock: { mode: 'pessimistic_write' },
      });
      const action =
        existingGrade === null ? 'grade.created' : 'grade.updated';
      const grade =
        existingGrade === null
          ? manager.create(Grade, {
              enrollmentId,
              value,
              createdBy: instructorId,
            })
          : Object.assign(existingGrade, { value });
      const savedGrade = await manager.save(grade);

      await this.recordChange(
        manager,
        instructorId,
        action,
        savedGrade.id,
        {
          enrollmentId,
          previousValue: existingGrade?.value ?? null,
          value,
        },
      );

      return manager.findOneOrFail(Grade, {
        where: { id: savedGrade.id },
        relations: {
          instructor: true,
          enrollment: {
            student: { user: true },
            course: { subject: true },
          },
        },
      });
    });
  }

  private async recordChange(
    manager: EntityManager,
    actorUserId: string,
    action: string,
    resourceId: string,
    details: Record<string, unknown>,
  ): Promise<void> {
    await manager.getRepository(AcademicAuditLog).save({
      actorUserId,
      action,
      resourceType: 'grade',
      resourceId,
      reason: null,
      details,
    });
  }
}
