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
import { CurrentUser } from '../../../auth/presentation/decorator/current-user.decorator.js';
import { UserRole } from '../../../auth/domain/entity/user-role.js';
import { Roles } from '../../../auth/presentation/decorator/roles.decorator.js';
import { JwtAuthGuard } from '../../../auth/presentation/guard/jwt-auth.guard.js';
import { RolesGuard } from '../../../auth/presentation/guard/roles.guard.js';
import { CoursesService } from '../../domain/service/courses.service.js';
import { CreateCourseRequest } from '../request/create-course.request.js';
import { UpdateCourseRequest } from '../request/update-course.request.js';
import type { CourseResponse } from '../response/course.response.js';

@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  getAll(): Promise<CourseResponse[]> {
    return this.coursesService.getAll();
  }

  @Get(':id')
  getById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CourseResponse> {
    return this.coursesService.getById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(
    @Body() request: CreateCourseRequest,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CourseResponse> {
    return this.coursesService.create(request, user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() request: UpdateCourseRequest,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CourseResponse> {
    return this.coursesService.update(id, request, user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.coursesService.delete(id);
  }
}
