import { AcademicPeriod } from '../../../../data/entity/academic-period.entity.js';
import { UserRole } from '../../../auth/domain/entity/user-role.js';
import { EnrollmentStatus } from '../entity/enrollment-status.js';
import { EnrollmentRuleError } from '../error/enrollment-rule.error.js';

type EnrollmentWindowRequest = {
  period: AcademicPeriod;
  now: Date;
  requesterRole: UserRole;
  reason?: string;
};

type EnrollmentCapacity = {
  activeEnrollmentCount: number;
  capacity: number;
};

export function validateEnrollmentWindow(
  request: EnrollmentWindowRequest,
): void {
  if (request.period.enabled === false) {
    throw new EnrollmentRuleError('period-disabled');
  }

  if (isInsideEnrollmentWindow(request) === true) {
    return;
  }

  if (request.requesterRole !== UserRole.ADMIN) {
    throw new EnrollmentRuleError('window-closed');
  }

  if (hasJustification(request.reason) === false) {
    throw new EnrollmentRuleError('reason-required');
  }
}

export function validateEnrollmentCapacity(
  capacity: EnrollmentCapacity,
): void {
  if (capacity.activeEnrollmentCount >= capacity.capacity) {
    throw new EnrollmentRuleError('capacity-full');
  }
}

export function validateEnrollmentIsNotActive(
  status: EnrollmentStatus | undefined,
): void {
  if (status === EnrollmentStatus.ACTIVE) {
    throw new EnrollmentRuleError('already-active');
  }
}

function isInsideEnrollmentWindow(
  request: EnrollmentWindowRequest,
): boolean {
  const timestamp = request.now.getTime();

  return (
    timestamp >= request.period.enrollmentStartsAt.getTime() &&
    timestamp < request.period.enrollmentEndsAt.getTime()
  );
}

function hasJustification(reason?: string): boolean {
  return reason !== undefined && reason.trim().length > 0;
}
