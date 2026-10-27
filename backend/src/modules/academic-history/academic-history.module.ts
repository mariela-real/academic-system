import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { EnrollmentsModule } from '../enrollments/enrollments.module.js';
import { GradesModule } from '../grades/grades.module.js';
import { StudentsModule } from '../students/students.module.js';
import { AcademicHistoryService } from './domain/service/academic-history.service.js';
import { AcademicHistoryController } from './presentation/controller/academic-history.controller.js';

@Module({
  imports: [AuthModule, EnrollmentsModule, GradesModule, StudentsModule],
  controllers: [AcademicHistoryController],
  providers: [AcademicHistoryService],
  exports: [AcademicHistoryService],
})
export class AcademicHistoryModule {}
