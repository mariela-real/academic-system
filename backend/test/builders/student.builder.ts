import { Student } from '../../src/modules/students/domain/entity/student.entity.js';
import { UserBuilder } from './user.builder.js';

export class StudentBuilder {
  private readonly student = Object.assign(new Student(), {
    id: '00000000-0000-4000-8000-000000000020',
    userId: '258a3bcf-796f-4472-a379-fab66fb47b06',
    user: new UserBuilder().build(),
    studentNumber: 'STU-1001',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  });

  withUserId(userId: string): this {
    this.student.userId = userId;
    this.student.user.id = userId;
    return this;
  }

  withStudentNumber(studentNumber: string): this {
    this.student.studentNumber = studentNumber;
    return this;
  }

  build(): Student {
    return Object.assign(new Student(), this.student);
  }
}
