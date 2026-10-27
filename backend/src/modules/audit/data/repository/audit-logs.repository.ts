import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcademicAuditLog } from '../../../../data/entity/academic-audit-log.entity.js';

@Injectable()
export class AuditLogsRepository {
  constructor(
    @InjectRepository(AcademicAuditLog)
    private readonly repository: Repository<AcademicAuditLog>,
  ) {}

  getAll(): Promise<AcademicAuditLog[]> {
    return this.repository.find({
      relations: { actor: true },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }
}
