import {
  apiRequest,
  expectArray,
  expectNumber,
  expectRecord,
  expectString,
} from '../../../shared/api/client'

export type Course = {
  id: string
  subjectId: string
  subjectCode: string
  subjectName: string
  academicPeriod: string
  capacity: number
  instructor: { id: string; fullName: string } | null
}

export async function getCourses(): Promise<Course[]> {
  return expectArray(await apiRequest('/courses'), 'cursos').map(parseCourse)
}

export async function createCourse(input: {
  subjectId: string
  academicPeriod: string
  capacity: number
  instructorId?: string
}): Promise<Course> {
  return parseCourse(
    await apiRequest('/courses', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  )
}

export async function updateCourse(
  id: string,
  input: { capacity: number; instructorId: string | null },
): Promise<Course> {
  return parseCourse(
    await apiRequest(`/courses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
  )
}

function parseCourse(value: unknown): Course {
  const record = expectRecord(value, 'curso')
  const instructor =
    record.instructor === null
      ? null
      : parseInstructor(record.instructor)

  return {
    id: expectString(record.id, 'id'),
    subjectId: expectString(record.subjectId, 'subjectId'),
    subjectCode: expectString(record.subjectCode, 'subjectCode'),
    subjectName: expectString(record.subjectName, 'subjectName'),
    academicPeriod: expectString(record.academicPeriod, 'academicPeriod'),
    capacity: expectNumber(record.capacity, 'capacity'),
    instructor,
  }
}

function parseInstructor(value: unknown): { id: string; fullName: string } {
  const record = expectRecord(value, 'docente')

  return {
    id: expectString(record.id, 'id'),
    fullName: expectString(record.fullName, 'fullName'),
  }
}
