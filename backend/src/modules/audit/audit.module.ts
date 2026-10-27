import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicAuditLog } from '../../data/entity/academic-audit-log.entity.js';
import { AuditLogsRepository } from './data/repository/audit-logs.repository.js';
import { AuditLogsService } from './domain/service/audit-logs.service.js';
import { AuditLogsController } from './presentation/controller/audit-logs.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([AcademicAuditLog])],
  controllers: [AuditLogsController],
  providers: [AuditLogsRepository, AuditLogsService],
  exports: [AuditLogsRepository, AuditLogsService],
})
export class AuditModule {}
