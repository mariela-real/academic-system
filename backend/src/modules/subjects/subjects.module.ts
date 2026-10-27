import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { SubjectsRepository } from './data/repository/subjects.repository.js';
import { Subject } from './domain/entity/subject.entity.js';
import { SubjectsService } from './domain/service/subjects.service.js';
import { SubjectsController } from './presentation/controller/subjects.controller.js';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Subject])],
  controllers: [SubjectsController],
  providers: [SubjectsRepository, SubjectsService],
  exports: [SubjectsService],
})
export class SubjectsModule {}
