import { randomUUID } from 'node:crypto';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { User } from '../../../auth/domain/entity/user.entity.js';
import { Subject } from '../../../subjects/domain/entity/subject.entity.js';

@Entity({ name: 'courses' })
export class Course {
  @PrimaryColumn('uuid')
  id: string = randomUUID();

  @Column({ name: 'subject_id', type: 'uuid' })
  subjectId: string;

  @ManyToOne(() => Subject, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @Column({ name: 'academic_period', type: 'varchar', length: 64 })
  academicPeriod: string;

  @Column({ type: 'integer' })
  capacity: number;

  @Column({ name: 'instructor_id', type: 'uuid', nullable: true })
  instructorId: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'instructor_id' })
  instructor: User | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
