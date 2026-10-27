export type EnrollmentRuleFailure =
  | 'course-not-found'
  | 'student-not-found'
  | 'period-not-found'
  | 'period-disabled'
  | 'window-closed'
  | 'reason-required'
  | 'capacity-full'
  | 'already-active'
  | 'enrollment-not-found'
  | 'enrollment-not-active'
  | 'not-owner';

export class EnrollmentRuleError extends Error {
  constructor(readonly failure: EnrollmentRuleFailure) {
    super(failure);
    this.name = EnrollmentRuleError.name;
  }
}
