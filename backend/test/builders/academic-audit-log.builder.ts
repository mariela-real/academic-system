import { AcademicAuditLog } from '../../src/data/entity/academic-audit-log.entity.js';
import { UserBuilder } from './user.builder.js';

export class AcademicAuditLogBuilder {
  private readonly auditLog = Object.assign(new AcademicAuditLog(), {
    id: '00000000-0000-4000-8000-000000000080',
    actorUserId: '258a3bcf-796f-4472-a379-fab66fb47b06',
    actor: new UserBuilder().build(),
    action: 'enrollment.created',
    resourceType: 'enrollment',
    resourceId: '00000000-0000-4000-8000-000000000040',
    reason: null,
    details: { status: 'active' },
    createdAt: new Date('2026-01-02T00:00:00.000Z'),
  });

  build(): AcademicAuditLog {
    return Object.assign(new AcademicAuditLog(), this.auditLog);
  }
}
