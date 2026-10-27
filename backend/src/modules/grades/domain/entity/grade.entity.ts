import { randomUUID } from 'node:crypto';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../../auth/domain/entity/user.entity.js';
import { Enrollment } from '../../../enrollments/domain/entity/enrollment.entity.js';

@Entity({ name: 'grades' })
export class Grade {
  @PrimaryColumn('uuid')
  id: string = randomUUID();

  @Column({ name: 'enrollment_id', type: 'uuid', unique: true })
  enrollmentId: string;

  @OneToOne(() => Enrollment, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'enrollment_id' })
  enrollment: Enrollment;

  @Column({ type: 'double precision' })
  value: number;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'created_by' })
  instructor: User;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
