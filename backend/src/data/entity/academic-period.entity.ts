import {
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
  Column,
} from 'typeorm';

@Entity({ name: 'academic_periods' })
export class AcademicPeriod {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  code: string;

  @Column({ name: 'enrollment_starts_at', type: 'timestamptz' })
  enrollmentStartsAt: Date;

  @Column({ name: 'enrollment_ends_at', type: 'timestamptz' })
  enrollmentEndsAt: Date;

  @Column({ type: 'boolean', default: false })
  enabled: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
