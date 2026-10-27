import { Enrollment } from '../../src/modules/enrollments/domain/entity/enrollment.entity.js';
import { EnrollmentStatus } from '../../src/modules/enrollments/domain/entity/enrollment-status.js';
import { CourseBuilder } from './course.builder.js';
import { StudentBuilder } from './student.builder.js';

export class EnrollmentBuilder {
  private readonly enrollment = Object.assign(new Enrollment(), {
    id: '00000000-0000-4000-8000-000000000040',
    studentId: '00000000-0000-4000-8000-000000000020',
    student: new StudentBuilder().build(),
    courseId: '00000000-0000-4000-8000-000000000010',
    course: new CourseBuilder().build(),
    status: EnrollmentStatus.ACTIVE,
    createdAt: new Date('2026-01-02T00:00:00.000Z'),
  });

  withStatus(status: EnrollmentStatus): this {
    this.enrollment.status = status;
    return this;
  }

  build(): Enrollment {
    return Object.assign(new Enrollment(), this.enrollment);
  }
}
