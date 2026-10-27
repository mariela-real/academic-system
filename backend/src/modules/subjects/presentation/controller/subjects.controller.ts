import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '../../../auth/domain/entity/user-role.js';
import { Roles } from '../../../auth/presentation/decorator/roles.decorator.js';
import { JwtAuthGuard } from '../../../auth/presentation/guard/jwt-auth.guard.js';
import { RolesGuard } from '../../../auth/presentation/guard/roles.guard.js';
import { CreateSubjectRequest } from '../request/create-subject.request.js';
import { UpdateSubjectRequest } from '../request/update-subject.request.js';
import { Subject } from '../../domain/entity/subject.entity.js';
import { SubjectsService } from '../../domain/service/subjects.service.js';

@Controller('subjects')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get()
  getAll(): Promise<Subject[]> {
    return this.subjectsService.getAll();
  }

  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string): Promise<Subject> {
    return this.subjectsService.getById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() request: CreateSubjectRequest): Promise<Subject> {
    return this.subjectsService.create(request);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() request: UpdateSubjectRequest,
  ): Promise<Subject> {
    return this.subjectsService.update(id, request);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.subjectsService.delete(id);
  }
}
