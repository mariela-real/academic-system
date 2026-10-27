import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from '../audit/audit.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { StudentsModule } from '../students/students.module.js';
import { Enrollment } from '../enrollments/domain/entity/enrollment.entity.js';
import { Course } from '../courses/domain/entity/course.entity.js';
import { Grade } from './domain/entity/grade.entity.js';
import { GradesRepository } from './data/repository/grades.repository.js';
import { GradesService } from './domain/service/grades.service.js';
import { GradesController } from './presentation/controller/grades.controller.js';

@Module({
  imports: [
    AuditModule,
    AuthModule,
    StudentsModule,
    TypeOrmModule.forFeature([Grade, Enrollment, Course]),
  ],
  controllers: [GradesController],
  providers: [GradesRepository, GradesService],
  exports: [GradesRepository, GradesService],
})
export class GradesModule {}
