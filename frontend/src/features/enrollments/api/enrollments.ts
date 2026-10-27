import {
  apiRequest,
  expectArray,
  expectRecord,
  expectString,
} from '../../../shared/api/client'

export type Enrollment = {
  id: string
  status: 'active' | 'cancelled'
  createdAt: string
  student: {
    id: string
    studentNumber: string
    fullName: string
  }
  course: {
    id: string
    subjectCode: string
    subjectName: string
    academicPeriod: string
  }
}

export async function getEnrollments(): Promise<Enrollment[]> {
  return expectArray(
    await apiRequest('/enrollments'),
    'inscripciones',
  ).map(parseEnrollment)
}

export async function createEnrollment(input: {
  courseId: string
  studentId?: string
  reason?: string
}): Promise<Enrollment> {
  return parseEnrollment(
    await apiRequest('/enrollments', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  )
}

export async function cancelEnrollment(
  id: string,
  reason?: string,
): Promise<Enrollment> {
  return parseEnrollment(
    await apiRequest(`/enrollments/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    }),
  )
}

function parseEnrollment(value: unknown): Enrollment {
  const record = expectRecord(value, 'inscripción')
  const status = expectString(record.status, 'status')

  if (status !== 'active' && status !== 'cancelled') {
    throw new Error('La API devolvió un estado de inscripción inválido.')
  }

  const student = expectRecord(record.student, 'estudiante')
  const course = expectRecord(record.course, 'curso')

  return {
    id: expectString(record.id, 'id'),
    status,
    createdAt: expectString(record.createdAt, 'createdAt'),
    student: {
      id: expectString(student.id, 'student.id'),
      studentNumber: expectString(
        student.studentNumber,
        'student.studentNumber',
      ),
      fullName: expectString(student.fullName, 'student.fullName'),
    },
    course: {
      id: expectString(course.id, 'course.id'),
      subjectCode: expectString(course.subjectCode, 'course.subjectCode'),
      subjectName: expectString(course.subjectName, 'course.subjectName'),
      academicPeriod: expectString(
        course.academicPeriod,
        'course.academicPeriod',
      ),
    },
  }
}
