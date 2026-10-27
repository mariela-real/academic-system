export class CourseCapacityLimitError extends Error {
  constructor() {
    super('Course capacity cannot be below active enrollments.');
    this.name = CourseCapacityLimitError.name;
  }
}
