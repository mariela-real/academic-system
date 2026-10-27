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
import type { AuthenticatedUser } from '../../../auth/domain/entity/authenticated-user.js';
import { UserRole } from '../../../auth/domain/entity/user-role.js';
import { CurrentUser } from '../../../auth/presentation/decorator/current-user.decorator.js';
import { Roles } from '../../../auth/presentation/decorator/roles.decorator.js';
import { JwtAuthGuard } from '../../../auth/presentation/guard/jwt-auth.guard.js';
import { RolesGuard } from '../../../auth/presentation/guard/roles.guard.js';
import { StudentsService } from '../../domain/service/students.service.js';
import { CreateStudentRequest } from '../request/create-student.request.js';
import { UpdateStudentRequest } from '../request/update-student.request.js';
import { StudentResponse } from '../response/student.response.js';

@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.TEACHER)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  getAll(): Promise<StudentResponse[]> {
    return this.studentsService.getAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  getById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<StudentResponse> {
    return this.studentsService.getById(id, user);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() request: CreateStudentRequest): Promise<StudentResponse> {
    return this.studentsService.create(request);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() request: UpdateStudentRequest,
  ): Promise<StudentResponse> {
    return this.studentsService.update(id, request);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.studentsService.delete(id);
  }
}
