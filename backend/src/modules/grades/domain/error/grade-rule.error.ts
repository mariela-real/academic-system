export type GradeRuleFailure =
  | 'enrollment-not-found'
  | 'enrollment-not-active'
  | 'instructor-not-assigned';

export class GradeRuleError extends Error {
  constructor(readonly failure: GradeRuleFailure) {
    super(failure);
    this.name = GradeRuleError.name;
  }
}
