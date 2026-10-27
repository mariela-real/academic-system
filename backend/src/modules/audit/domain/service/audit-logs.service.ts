import { Injectable } from '@nestjs/common';
import { AuditLogsRepository } from '../../data/repository/audit-logs.repository.js';
import type { AcademicAuditLog } from '../../../../data/entity/academic-audit-log.entity.js';
import type { AuditLogResponse } from '../../presentation/response/audit-log.response.js';

@Injectable()
export class AuditLogsService {
  constructor(private readonly auditLogsRepository: AuditLogsRepository) {}

  async getAll(): Promise<AuditLogResponse[]> {
    const auditLogs = await this.auditLogsRepository.getAll();

    return auditLogs.map((auditLog) => this.toResponse(auditLog));
  }

  private toResponse(auditLog: AcademicAuditLog): AuditLogResponse {
    return {
      id: auditLog.id,
      actor: {
        id: auditLog.actor.id,
        email: auditLog.actor.email,
        fullName: auditLog.actor.fullName,
      },
      action: auditLog.action,
      resourceType: auditLog.resourceType,
      resourceId: auditLog.resourceId,
      reason: auditLog.reason,
      details: auditLog.details,
      createdAt: auditLog.createdAt,
    };
  }
}
