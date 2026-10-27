import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { Student } from './domain/entity/student.entity.js';
import { StudentsRepository } from './data/repository/students.repository.js';
import { StudentsService } from './domain/service/students.service.js';
import { StudentsController } from './presentation/controller/students.controller.js';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Student])],
  controllers: [StudentsController],
  providers: [StudentsRepository, StudentsService],
  exports: [StudentsRepository, StudentsService],
})
export class StudentsModule {}
