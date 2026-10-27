import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicPeriodsModule } from '../academic-periods/academic-periods.module.js';
import { AuditModule } from '../audit/audit.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { SubjectsModule } from '../subjects/subjects.module.js';
import { Course } from './domain/entity/course.entity.js';
import { CoursesRepository } from './data/repository/courses.repository.js';
import { CoursesService } from './domain/service/courses.service.js';
import { CoursesController } from './presentation/controller/courses.controller.js';

@Module({
  imports: [
    AuthModule,
    AcademicPeriodsModule,
    AuditModule,
    SubjectsModule,
    TypeOrmModule.forFeature([Course]),
  ],
  controllers: [CoursesController],
  providers: [CoursesRepository, CoursesService],
  exports: [CoursesRepository, CoursesService],
})
export class CoursesModule {}
