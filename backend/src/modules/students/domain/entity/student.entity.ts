import { randomUUID } from 'node:crypto';
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  Column,
} from 'typeorm';
import { User } from '../../../auth/domain/entity/user.entity.js';

@Entity({ name: 'students' })
export class Student {
  @PrimaryColumn('uuid')
  id: string = randomUUID();

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @OneToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'student_number', type: 'varchar', length: 64, unique: true })
  studentNumber: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
