import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isUniqueConstraintViolation } from '../../../../data/repository/database-errors.js';
import { AcademicPeriod } from '../../../../data/entity/academic-period.entity.js';
import type { AuthenticatedUser } from '../../../auth/domain/entity/authenticated-user.js';
import { AcademicPeriodsRepository } from '../../data/repository/academic-periods.repository.js';
import { CreateAcademicPeriodRequest } from '../../presentation/request/create-academic-period.request.js';
import { UpdateAcademicPeriodRequest } from '../../presentation/request/update-academic-period.request.js';
import type { AcademicPeriodResponse } from '../../presentation/response/academic-period.response.js';

@Injectable()
export class AcademicPeriodsService {
  constructor(
    @Inject(AcademicPeriodsRepository)
    private readonly academicPeriodsRepository: Pick<
      AcademicPeriodsRepository,
      'getAll' | 'getByCode' | 'create' | 'update'
    >,
  ) {}

  async getAll(): Promise<AcademicPeriodResponse[]> {
    const periods = await this.academicPeriodsRepository.getAll();

    return periods.map((period) => this.toResponse(period));
  }

  async getEnabledByCode(code: string): Promise<AcademicPeriod> {
    const period = await this.getPeriod(code);

    if (period.enabled === false) {
      throw new ConflictException('La gestión académica está deshabilitada.');
    }

    return period;
  }

  async create(
    request: CreateAcademicPeriodRequest,
    actor: AuthenticatedUser,
  ): Promise<AcademicPeriodResponse> {
    const period = this.toCreateValues(request);
    this.validateWindow(period.enrollmentStartsAt, period.enrollmentEndsAt);

    try {
      const createdPeriod = await this.academicPeriodsRepository.create(
        period,
        actor.id,
      );

      return this.toResponse(createdPeriod);
    } catch (error) {
      if (isUniqueConstraintViolation(error)) {
        throw new ConflictException('La gestión académica ya existe.');
      }

      throw error;
    }
  }

  async update(
    code: string,
    request: UpdateAcademicPeriodRequest,
    actor: AuthenticatedUser,
  ): Promise<AcademicPeriodResponse> {
    const existingPeriod = await this.getPeriod(code);
    const values = this.toUpdateValues(request);
    const enrollmentStartsAt =
      values.enrollmentStartsAt ?? existingPeriod.enrollmentStartsAt;
    const enrollmentEndsAt =
      values.enrollmentEndsAt ?? existingPeriod.enrollmentEndsAt;

    this.validateWindow(enrollmentStartsAt, enrollmentEndsAt);

    const updatedPeriod = await this.academicPeriodsRepository.update(
      code,
      values,
      actor.id,
    );

    if (updatedPeriod === null) {
      throw new NotFoundException('No se encontró la gestión académica.');
    }

    return this.toResponse(updatedPeriod);
  }

  private async getPeriod(code: string): Promise<AcademicPeriod> {
    const period = await this.academicPeriodsRepository.getByCode(code);

    if (period === null) {
      throw new NotFoundException('No se encontró la gestión académica.');
    }

    return period;
  }

  private toCreateValues(
    request: CreateAcademicPeriodRequest,
  ): Pick<
    AcademicPeriod,
    'code' | 'enrollmentStartsAt' | 'enrollmentEndsAt' | 'enabled'
  > {
    return {
      code: request.code.trim(),
      enrollmentStartsAt: new Date(request.enrollmentStartsAt),
      enrollmentEndsAt: new Date(request.enrollmentEndsAt),
      enabled: request.enabled,
    };
  }

  private toUpdateValues(
    request: UpdateAcademicPeriodRequest,
  ): Partial<AcademicPeriod> {
    const values: Partial<AcademicPeriod> = {};

    if (request.enrollmentStartsAt !== undefined) {
      values.enrollmentStartsAt = new Date(request.enrollmentStartsAt);
    }

    if (request.enrollmentEndsAt !== undefined) {
      values.enrollmentEndsAt = new Date(request.enrollmentEndsAt);
    }

    if (request.enabled !== undefined) {
      values.enabled = request.enabled;
    }

    if (Object.keys(values).length === 0) {
      throw new BadRequestException('Debes indicar al menos un campo.');
    }

    return values;
  }

  private validateWindow(startsAt: Date, endsAt: Date): void {
    if (startsAt.getTime() >= endsAt.getTime()) {
      throw new BadRequestException(
        'El cierre de inscripciones debe ser posterior al inicio.',
      );
    }
  }

  private toResponse(period: AcademicPeriod): AcademicPeriodResponse {
    return {
      code: period.code,
      enrollmentStartsAt: period.enrollmentStartsAt,
      enrollmentEndsAt: period.enrollmentEndsAt,
      enabled: period.enabled,
    };
  }
}
