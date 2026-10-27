import { AcademicPeriod } from '../../src/data/entity/academic-period.entity.js';

export class AcademicPeriodBuilder {
  private readonly period = Object.assign(new AcademicPeriod(), {
    code: '2026-1',
    enrollmentStartsAt: new Date('2026-01-01T04:00:00.000Z'),
    enrollmentEndsAt: new Date('2026-06-30T04:00:00.000Z'),
    enabled: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  });

  withEnabled(enabled: boolean): this {
    this.period.enabled = enabled;
    return this;
  }

  build(): AcademicPeriod {
    return Object.assign(new AcademicPeriod(), this.period);
  }
}
