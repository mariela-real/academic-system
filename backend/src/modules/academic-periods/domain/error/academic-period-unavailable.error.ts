export class AcademicPeriodUnavailableError extends Error {
  constructor() {
    super('Academic period is unavailable.');
    this.name = AcademicPeriodUnavailableError.name;
  }
}
