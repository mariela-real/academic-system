import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  Body,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../../../auth/domain/entity/authenticated-user.js';
import { UserRole } from '../../../auth/domain/entity/user-role.js';
import { CurrentUser } from '../../../auth/presentation/decorator/current-user.decorator.js';
import { Roles } from '../../../auth/presentation/decorator/roles.decorator.js';
import { JwtAuthGuard } from '../../../auth/presentation/guard/jwt-auth.guard.js';
import { RolesGuard } from '../../../auth/presentation/guard/roles.guard.js';
import { GradesService } from '../../domain/service/grades.service.js';
import { SetGradeRequest } from '../request/set-grade.request.js';
import type { GradeResponse } from '../response/grade.response.js';

@Controller('grades')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Get()
  getAll(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<GradeResponse[]> {
    return this.gradesService.getAll(user);
  }

  @Get(':enrollmentId')
  getByEnrollmentId(
    @Param('enrollmentId', ParseUUIDPipe) enrollmentId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<GradeResponse> {
    return this.gradesService.getByEnrollmentId(enrollmentId, user);
  }

  @Put(':enrollmentId')
  @Roles(UserRole.TEACHER)
  set(
    @Param('enrollmentId', ParseUUIDPipe) enrollmentId: string,
    @Body() request: SetGradeRequest,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<GradeResponse> {
    return this.gradesService.set(enrollmentId, request, user);
  }
}
