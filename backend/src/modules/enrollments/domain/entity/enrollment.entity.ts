import { randomUUID } from 'node:crypto';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { Course } from '../../../courses/domain/entity/course.entity.js';
import { Student } from '../../../students/domain/entity/student.entity.js';
import { EnrollmentStatus } from './enrollment-status.js';

@Entity({ name: 'enrollments' })
@Unique('uq_enrollments_student_course', ['studentId', 'courseId'])
export class Enrollment {
  @PrimaryColumn('uuid')
  id: string = randomUUID();

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @ManyToOne(() => Student, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ name: 'course_id', type: 'uuid' })
  courseId: string;

  @ManyToOne(() => Course, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column({
    type: 'enum',
    enum: EnrollmentStatus,
    enumName: 'enrollment_status_enum',
    default: EnrollmentStatus.ACTIVE,
  })
  status: EnrollmentStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
