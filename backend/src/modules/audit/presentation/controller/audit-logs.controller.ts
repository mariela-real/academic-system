import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserRole } from '../../../auth/domain/entity/user-role.js';
import { Roles } from '../../../auth/presentation/decorator/roles.decorator.js';
import { JwtAuthGuard } from '../../../auth/presentation/guard/jwt-auth.guard.js';
import { RolesGuard } from '../../../auth/presentation/guard/roles.guard.js';
import { AuditLogsService } from '../../domain/service/audit-logs.service.js';
import type { AuditLogResponse } from '../response/audit-log.response.js';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  getAll(): Promise<AuditLogResponse[]> {
    return this.auditLogsService.getAll();
  }
}
