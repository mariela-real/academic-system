import {
  Body,
  Controller,
  Get,
  Param,
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
import { AcademicPeriodsService } from '../../domain/service/academic-periods.service.js';
import { CreateAcademicPeriodRequest } from '../request/create-academic-period.request.js';
import { UpdateAcademicPeriodRequest } from '../request/update-academic-period.request.js';
import type { AcademicPeriodResponse } from '../response/academic-period.response.js';

@Controller('academic-periods')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
export class AcademicPeriodsController {
  constructor(
    private readonly academicPeriodsService: AcademicPeriodsService,
  ) {}

  @Get()
  getAll(): Promise<AcademicPeriodResponse[]> {
    return this.academicPeriodsService.getAll();
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(
    @Body() request: CreateAcademicPeriodRequest,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AcademicPeriodResponse> {
    return this.academicPeriodsService.create(request, user);
  }

  @Patch(':code')
  @Roles(UserRole.ADMIN)
  update(
    @Param('code') code: string,
    @Body() request: UpdateAcademicPeriodRequest,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AcademicPeriodResponse> {
    return this.academicPeriodsService.update(code, request, user);
  }
}
