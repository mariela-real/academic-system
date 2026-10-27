export function parseCourseCapacity(value: string): number | null {
  const capacity = Number(value)

  if (
    value.trim().length === 0 ||
    Number.isInteger(capacity) === false ||
    capacity < 1
  ) {
    return null
  }

  return capacity
}
