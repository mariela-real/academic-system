import { Grade } from '../../src/modules/grades/domain/entity/grade.entity.js';
import { EnrollmentBuilder } from './enrollment.builder.js';
import { UserBuilder } from './user.builder.js';

export class GradeBuilder {
  private readonly grade = Object.assign(new Grade(), {
    id: '00000000-0000-4000-8000-000000000060',
    enrollmentId: '00000000-0000-4000-8000-000000000040',
    enrollment: new EnrollmentBuilder().build(),
    value: 85,
    createdBy: '258a3bcf-796f-4472-a379-fab66fb47b06',
    instructor: new UserBuilder().build(),
    updatedAt: new Date('2026-02-01T00:00:00.000Z'),
  });

  build(): Grade {
    return Object.assign(new Grade(), this.grade);
  }
}
