import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../../../auth/domain/entity/authenticated-user.js';
import { UserRole } from '../../../auth/domain/entity/user-role.js';
import { CurrentUser } from '../../../auth/presentation/decorator/current-user.decorator.js';
import { Roles } from '../../../auth/presentation/decorator/roles.decorator.js';
import { JwtAuthGuard } from '../../../auth/presentation/guard/jwt-auth.guard.js';
import { RolesGuard } from '../../../auth/presentation/guard/roles.guard.js';
import { AcademicHistoryService } from '../../domain/service/academic-history.service.js';
import type { AcademicHistoryResponse } from '../response/academic-history.response.js';

@Controller('academic-history')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
export class AcademicHistoryController {
  constructor(private readonly academicHistoryService: AcademicHistoryService) {}

  @Get('me')
  @Roles(UserRole.STUDENT)
  getOwnHistory(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AcademicHistoryResponse> {
    return this.academicHistoryService.getOwnHistory(user);
  }

  @Get('students/:studentId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  getStudentHistory(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AcademicHistoryResponse> {
    return this.academicHistoryService.getStudentHistory(studentId, user);
  }
}
