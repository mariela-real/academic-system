import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicPeriodsModule } from '../academic-periods/academic-periods.module.js';
import { AuditModule } from '../audit/audit.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { CoursesModule } from '../courses/courses.module.js';
import { StudentsModule } from '../students/students.module.js';
import { Enrollment } from './domain/entity/enrollment.entity.js';
import { EnrollmentsRepository } from './data/repository/enrollments.repository.js';
import { EnrollmentsService } from './domain/service/enrollments.service.js';
import { EnrollmentsController } from './presentation/controller/enrollments.controller.js';

@Module({
  imports: [
    AcademicPeriodsModule,
    AuditModule,
    AuthModule,
    CoursesModule,
    StudentsModule,
    TypeOrmModule.forFeature([Enrollment]),
  ],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsRepository, EnrollmentsService],
  exports: [EnrollmentsRepository, EnrollmentsService],
})
export class EnrollmentsModule {}
