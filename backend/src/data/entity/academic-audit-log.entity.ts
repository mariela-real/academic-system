import { randomUUID } from 'node:crypto';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { User } from '../../modules/auth/domain/entity/user.entity.js';

@Entity({ name: 'academic_audit_logs' })
export class AcademicAuditLog {
  @PrimaryColumn('uuid')
  id: string = randomUUID();

  @Column({ name: 'actor_user_id', type: 'uuid' })
  actorUserId: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'actor_user_id' })
  actor: User;

  @Column({ type: 'varchar', length: 80 })
  action: string;

  @Column({ name: 'resource_type', type: 'varchar', length: 50 })
  resourceType: string;

  @Column({ name: 'resource_id', type: 'varchar', length: 64 })
  resourceId: string;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
