import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { AcademicAuditLog } from '../../../../data/entity/academic-audit-log.entity.js';
import { AcademicPeriod } from '../../../../data/entity/academic-period.entity.js';
import { Course } from '../../../courses/domain/entity/course.entity.js';
import { Student } from '../../../students/domain/entity/student.entity.js';
import { UserRole } from '../../../auth/domain/entity/user-role.js';
import { Enrollment } from '../../domain/entity/enrollment.entity.js';
import { EnrollmentStatus } from '../../domain/entity/enrollment-status.js';
import { EnrollmentRuleError } from '../../domain/error/enrollment-rule.error.js';
import {
  validateEnrollmentCapacity,
  validateEnrollmentIsNotActive,
  validateEnrollmentWindow,
} from '../../domain/policy/enrollment-policy.js';

type EnrollmentOperation = {
  enrollment: Enrollment;
  action: 'enrollment.created' | 'enrollment.reactivated';
};

type CreateOrReactivateRequest = {
  studentId: string;
  courseId: string;
  actorUserId: string;
  requesterRole: UserRole;
  reason?: string;
};

type CancelEnrollmentCommand = {
  id: string;
  actorUserId: string;
  requesterUserId: string;
  requesterRole: UserRole;
  reason?: string;
};

@Injectable()
export class EnrollmentsRepository {
  constructor(
    @InjectRepository(Enrollment)
    private readonly repository: Repository<Enrollment>,
    private readonly dataSource: DataSource,
  ) {}

  getAll(): Promise<Enrollment[]> {
    return this.repository.find({
      relations: { student: { user: true }, course: { subject: true } },
      order: { createdAt: 'DESC' },
    });
  }

  getById(id: string): Promise<Enrollment | null> {
    return this.repository.findOne({
      where: { id },
      relations: {
        student: { user: true },
        course: { subject: true },
      },
    });
  }

  getByStudentId(studentId: string): Promise<Enrollment[]> {
    return this.repository.find({
      where: { studentId },
      relations: { student: { user: true }, course: { subject: true } },
      order: { createdAt: 'DESC' },
    });
  }

  getByStudentAndInstructorId(
    studentId: string,
    instructorId: string,
  ): Promise<Enrollment[]> {
    return this.repository.find({
      where: {
        studentId,
        course: { instructorId },
      },
      relations: { student: { user: true }, course: { subject: true } },
      order: { createdAt: 'DESC' },
    });
  }

  getByInstructorId(instructorId: string): Promise<Enrollment[]> {
    return this.repository.find({
      where: {
        course: { instructorId },
        status: EnrollmentStatus.ACTIVE,
      },
      relations: { student: { user: true }, course: { subject: true } },
      order: { createdAt: 'DESC' },
    });
  }

  createOrReactivate(
    request: CreateOrReactivateRequest,
  ): Promise<EnrollmentOperation> {
    return this.dataSource.transaction(async (manager) => {
      const { studentId, courseId, actorUserId, requesterRole, reason } =
        request;
      const course = await this.getLockedCourse(manager, courseId);
      const period = await this.getLockedPeriod(manager, course.academicPeriod);
      validateEnrollmentWindow({
        period,
        now: new Date(),
        requesterRole,
        reason,
      });

      const student = await manager.findOne(Student, {
        where: { id: studentId },
      });

      if (student === null) {
        throw new EnrollmentRuleError('student-not-found');
      }

      const existingEnrollment = await manager.findOne(Enrollment, {
        where: { studentId, courseId },
        lock: { mode: 'pessimistic_write' },
      });

      validateEnrollmentIsNotActive(existingEnrollment?.status);

      const activeEnrollmentCount = await manager.countBy(Enrollment, {
        courseId: course.id,
        status: EnrollmentStatus.ACTIVE,
      });
      validateEnrollmentCapacity({
        activeEnrollmentCount,
        capacity: course.capacity,
      });

      const action =
        existingEnrollment === null
          ? 'enrollment.created'
          : 'enrollment.reactivated';
      const enrollment =
        existingEnrollment === null
          ? manager.create(Enrollment, {
              studentId,
              courseId,
              status: EnrollmentStatus.ACTIVE,
            })
          : Object.assign(existingEnrollment, {
              status: EnrollmentStatus.ACTIVE,
            });
      const savedEnrollment = await manager.save(enrollment);

      await this.recordChange(
        manager,
        actorUserId,
        action,
        savedEnrollment.id,
        reason ?? null,
        {
          studentId,
          courseId,
          previousStatus: existingEnrollment?.status ?? null,
          status: EnrollmentStatus.ACTIVE,
        },
      );

      const completeEnrollment = await this.getEnrollmentWithRelations(
        manager,
        savedEnrollment.id,
      );

      return { enrollment: completeEnrollment, action };
    });
  }

  cancel(request: CancelEnrollmentCommand): Promise<Enrollment> {
    return this.dataSource.transaction(async (manager) => {
      const {
        id,
        actorUserId,
        requesterUserId,
        requesterRole,
        reason,
      } = request;
      const enrollmentReference = await manager.findOne(Enrollment, {
        where: { id },
      });

      if (enrollmentReference === null) {
        throw new EnrollmentRuleError('enrollment-not-found');
      }

      const course = await this.getLockedCourse(
        manager,
        enrollmentReference.courseId,
      );
      const period = await this.getLockedPeriod(manager, course.academicPeriod);
      validateEnrollmentWindow({
        period,
        now: new Date(),
        requesterRole,
        reason,
      });

      const enrollment = await manager.findOne(Enrollment, {
        where: { id },
        relations: { student: true },
        lock: { mode: 'pessimistic_write' },
      });

      if (enrollment === null) {
        throw new EnrollmentRuleError('enrollment-not-found');
      }

      if (
        requesterRole !== UserRole.ADMIN &&
        enrollment.student.userId !== requesterUserId
      ) {
        throw new EnrollmentRuleError('not-owner');
      }

      if (enrollment.status !== EnrollmentStatus.ACTIVE) {
        throw new EnrollmentRuleError('enrollment-not-active');
      }

      enrollment.status = EnrollmentStatus.CANCELLED;
      const savedEnrollment = await manager.save(enrollment);

      await this.recordChange(
        manager,
        actorUserId,
        'enrollment.cancelled',
        savedEnrollment.id,
        reason ?? null,
        {
          studentId: savedEnrollment.studentId,
          courseId: savedEnrollment.courseId,
          previousStatus: EnrollmentStatus.ACTIVE,
          status: EnrollmentStatus.CANCELLED,
        },
      );

      return this.getEnrollmentWithRelations(manager, savedEnrollment.id);
    });
  }

  private async getLockedCourse(
    manager: EntityManager,
    courseId: string,
  ): Promise<Course> {
    const course = await manager.findOne(Course, {
      where: { id: courseId },
      lock: { mode: 'pessimistic_write' },
    });

    if (course === null) {
      throw new EnrollmentRuleError('course-not-found');
    }

    return course;
  }

  private async getLockedPeriod(
    manager: EntityManager,
    code: string,
  ): Promise<AcademicPeriod> {
    const period = await manager.findOne(AcademicPeriod, {
      where: { code },
      lock: { mode: 'pessimistic_read' },
    });

    if (period === null) {
      throw new EnrollmentRuleError('period-not-found');
    }

    if (period.enabled === false) {
      throw new EnrollmentRuleError('period-disabled');
    }

    return period;
  }

  private async recordChange(
    manager: EntityManager,
    actorUserId: string,
    action: string,
    resourceId: string,
    reason: string | null,
    details: Record<string, unknown>,
  ): Promise<void> {
    await manager.getRepository(AcademicAuditLog).save({
      actorUserId,
      action,
      resourceType: 'enrollment',
      resourceId,
      reason,
      details,
    });
  }

  private getEnrollmentWithRelations(
    manager: EntityManager,
    id: string,
  ): Promise<Enrollment> {
    return manager.findOneOrFail(Enrollment, {
      where: { id },
      relations: { student: { user: true }, course: { subject: true } },
    });
  }
}
