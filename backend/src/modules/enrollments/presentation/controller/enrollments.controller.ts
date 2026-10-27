import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../../../auth/domain/entity/authenticated-user.js';
import { UserRole } from '../../../auth/domain/entity/user-role.js';
import { CurrentUser } from '../../../auth/presentation/decorator/current-user.decorator.js';
import { Roles } from '../../../auth/presentation/decorator/roles.decorator.js';
import { JwtAuthGuard } from '../../../auth/presentation/guard/jwt-auth.guard.js';
import { RolesGuard } from '../../../auth/presentation/guard/roles.guard.js';
import { EnrollmentsService } from '../../domain/service/enrollments.service.js';
import { CancelEnrollmentRequest } from '../request/cancel-enrollment.request.js';
import { CreateEnrollmentRequest } from '../request/create-enrollment.request.js';
import type { EnrollmentResponse } from '../response/enrollment.response.js';

@Controller('enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get()
  getAll(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<EnrollmentResponse[]> {
    return this.enrollmentsService.getAll(user);
  }

  @Get(':id')
  getById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<EnrollmentResponse> {
    return this.enrollmentsService.getById(id, user);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.STUDENT)
  create(
    @Body() request: CreateEnrollmentRequest,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<EnrollmentResponse> {
    return this.enrollmentsService.create(request, user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.STUDENT)
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() request: CancelEnrollmentRequest,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<EnrollmentResponse> {
    return this.enrollmentsService.cancel(id, request, user);
  }
}
