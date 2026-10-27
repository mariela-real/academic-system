import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { AcademicAuditLog } from '../../../../data/entity/academic-audit-log.entity.js';
import { AcademicPeriod } from '../../../../data/entity/academic-period.entity.js';

@Injectable()
export class AcademicPeriodsRepository {
  constructor(
    @InjectRepository(AcademicPeriod)
    private readonly repository: Repository<AcademicPeriod>,
    private readonly dataSource: DataSource,
  ) {}

  getAll(): Promise<AcademicPeriod[]> {
    return this.repository.find({ order: { code: 'DESC' } });
  }

  getByCode(code: string): Promise<AcademicPeriod | null> {
    return this.repository.findOneBy({ code });
  }

  create(
    period: Pick<
      AcademicPeriod,
      'code' | 'enrollmentStartsAt' | 'enrollmentEndsAt' | 'enabled'
    >,
    actorUserId: string,
  ): Promise<AcademicPeriod> {
    return this.dataSource.transaction(async (manager) => {
      const savedPeriod = await manager.save(
        AcademicPeriod,
        manager.create(AcademicPeriod, period),
      );

      await this.recordChange(
        manager,
        actorUserId,
        'academic_period.created',
        savedPeriod.code,
        null,
        this.toDetails(savedPeriod),
      );

      return savedPeriod;
    });
  }

  update(
    code: string,
    values: Partial<AcademicPeriod>,
    actorUserId: string,
  ): Promise<AcademicPeriod | null> {
    return this.dataSource.transaction(async (manager) => {
      const period = await manager.findOne(AcademicPeriod, {
        where: { code },
        lock: { mode: 'pessimistic_write' },
      });

      if (period === null) {
        return null;
      }

      const previousDetails = this.toDetails(period);
      Object.assign(period, values);
      const savedPeriod = await manager.save(period);

      await this.recordChange(
        manager,
        actorUserId,
        'academic_period.updated',
        savedPeriod.code,
        null,
        {
          before: previousDetails,
          after: this.toDetails(savedPeriod),
        },
      );

      return savedPeriod;
    });
  }

  private async recordChange(
    manager: EntityManager,
    actorUserId: string,
    action: string,
    resourceId: string,
    reason: string | null,
    details: Record<string, unknown> | null,
  ): Promise<void> {
    await manager.getRepository(AcademicAuditLog).save({
      actorUserId,
      action,
      resourceType: 'academic_period',
      resourceId,
      reason,
      details,
    });
  }

  private toDetails(period: AcademicPeriod): Record<string, unknown> {
    return {
      enrollmentStartsAt: period.enrollmentStartsAt.toISOString(),
      enrollmentEndsAt: period.enrollmentEndsAt.toISOString(),
      enabled: period.enabled,
    };
  }
}
