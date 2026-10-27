
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicPeriod } from '../../data/entity/academic-period.entity.js';
import { AuthModule } from '../auth/auth.module.js';
import { AuditModule } from '../audit/audit.module.js';
import { AcademicPeriodsRepository } from './data/repository/academic-periods.repository.js';
import { AcademicPeriodsService } from './domain/service/academic-periods.service.js';
import { AcademicPeriodsController } from './presentation/controller/academic-periods.controller.js';

@Module({
  imports: [
    AuthModule,
    AuditModule,
    TypeOrmModule.forFeature([AcademicPeriod]),
  ],
  controllers: [AcademicPeriodsController],
  providers: [AcademicPeriodsRepository, AcademicPeriodsService],
  exports: [AcademicPeriodsRepository, AcademicPeriodsService],
})
export class AcademicPeriodsModule {}
