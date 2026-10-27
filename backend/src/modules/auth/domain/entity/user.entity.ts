import { randomUUID } from 'node:crypto';
import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';
import { UserRole } from './user-role.js';

@Entity({ name: 'users' })
export class User {
  @PrimaryColumn('uuid')
  id: string = randomUUID();

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'full_name', type: 'varchar', length: 160 })
  fullName: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 100 })
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, enumName: 'users_role_enum' })
  role: UserRole;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
