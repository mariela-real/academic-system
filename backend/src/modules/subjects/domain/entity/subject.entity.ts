import { randomUUID } from 'node:crypto';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'subjects' })
export class Subject {
  @PrimaryColumn('uuid')
  id: string = randomUUID();

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;
}
