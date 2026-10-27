import { describe, expect, it, vi } from 'vitest';
import { AcademicAuditLogBuilder } from '../../../../../test/builders/academic-audit-log.builder.js';
import { AuditLogsRepository } from '../../data/repository/audit-logs.repository.js';
import { AuditLogsService } from './audit-logs.service.js';

describe('Academic audit records', () => {
  it('does not expose internal user credentials in audit responses', async () => {
    // arrange
    const auditLog = new AcademicAuditLogBuilder().build();
    const auditLogsRepository: Pick<AuditLogsRepository, 'getAll'> = {
      getAll: vi.fn().mockResolvedValue([auditLog]),
    };
    const auditLogsService = new AuditLogsService(auditLogsRepository);

    // act
    const response = await auditLogsService.getAll();

    // assert
    expect(response[0]).toMatchObject({
      actor: {
        id: auditLog.actor.id,
        email: auditLog.actor.email,
        fullName: auditLog.actor.fullName,
      },
    });
    expect(response[0].actor).not.toHaveProperty('passwordHash');
  });
});
