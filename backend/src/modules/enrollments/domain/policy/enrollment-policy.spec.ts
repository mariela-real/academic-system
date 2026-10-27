import { describe, expect, it } from 'vitest';
import { AcademicPeriodBuilder } from '../../../../../test/builders/academic-period.builder.js';
import { UserRole } from '../../../auth/domain/entity/user-role.js';
import { EnrollmentStatus } from '../entity/enrollment-status.js';
import { EnrollmentRuleError } from '../error/enrollment-rule.error.js';
import {
  validateEnrollmentCapacity,
  validateEnrollmentIsNotActive,
  validateEnrollmentWindow,
} from './enrollment-policy.js';

describe('Enrollment rules', () => {
  it('closes student enrollment exactly at the configured ending instant', () => {
    // arrange
    const period = new AcademicPeriodBuilder().build();

    // act
    const response = () =>
      validateEnrollmentWindow({
        period,
        now: period.enrollmentEndsAt,
        requesterRole: UserRole.STUDENT,
      });

    // assert
    expect(response).toThrow(
      new EnrollmentRuleError('window-closed'),
    );
  });

  it('requires an administrator reason for an exception outside the window', () => {
    // arrange
    const period = new AcademicPeriodBuilder().build();
    const afterClosing = new Date(
      period.enrollmentEndsAt.getTime() + 1,
    );

    // act
    const response = () =>
      validateEnrollmentWindow({
        period,
        now: afterClosing,
        requesterRole: UserRole.ADMIN,
      });

    // assert
    expect(response).toThrow(
      new EnrollmentRuleError('reason-required'),
    );
  });

  it('does not allow administrators to bypass a disabled academic period', () => {
    // arrange
    const period = new AcademicPeriodBuilder().withEnabled(false).build();

    // act
    const response = () =>
      validateEnrollmentWindow({
        period,
        now: new Date('2026-02-01T12:00:00.000Z'),
        requesterRole: UserRole.ADMIN,
        reason: 'Excepción autorizada',
      });

    // assert
    expect(response).toThrow(
      new EnrollmentRuleError('period-disabled'),
    );
  });

  it('rejects enrollment when all course places are occupied', () => {
    // arrange
    const capacity = { activeEnrollmentCount: 30, capacity: 30 };

    // act
    const response = () => validateEnrollmentCapacity(capacity);

    // assert
    expect(response).toThrow(
      new EnrollmentRuleError('capacity-full'),
    );
  });

  it('rejects a second active enrollment in the same course', () => {
    // arrange
    const status = EnrollmentStatus.ACTIVE;

    // act
    const response = () => validateEnrollmentIsNotActive(status);

    // assert
    expect(response).toThrow(
      new EnrollmentRuleError('already-active'),
    );
  });
});
