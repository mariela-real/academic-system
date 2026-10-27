import { Course } from '../../src/modules/courses/domain/entity/course.entity.js';
import { SubjectBuilder } from './subject.builder.js';
import { UserBuilder } from './user.builder.js';
import { UserRole } from '../../src/modules/auth/domain/entity/user-role.js';

export class CourseBuilder {
  private readonly course = Object.assign(new Course(), {
    id: '00000000-0000-4000-8000-000000000010',
    subjectId: '00000000-0000-4000-8000-000000000001',
    subject: new SubjectBuilder().build(),
    academicPeriod: '2026-1',
    capacity: 30,
    instructorId: null,
    instructor: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  });

  withAcademicPeriod(academicPeriod: string): this {
    this.course.academicPeriod = academicPeriod;
    return this;
  }

  withInstructor(): this {
    const instructor = new UserBuilder().withRole(UserRole.TEACHER).build();

    this.course.instructorId = instructor.id;
    this.course.instructor = instructor;

    return this;
  }

  build(): Course {
    return Object.assign(new Course(), this.course);
  }
}
