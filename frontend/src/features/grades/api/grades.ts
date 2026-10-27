import {
  apiRequest,
  expectArray,
  expectNumber,
  expectRecord,
  expectString,
} from '../../../shared/api/client'

export type Grade = {
  id: string
  value: number
  updatedAt: string
  enrollment: {
    id: string
    status: 'active' | 'cancelled'
    student: { id: string; studentNumber: string; fullName: string }
    course: {
      id: string
      subjectCode: string
      subjectName: string
      academicPeriod: string
    }
  }
}

export async function getGrades(): Promise<Grade[]> {
  return expectArray(await apiRequest('/grades'), 'calificaciones').map(
    parseGrade,
  )
}

export async function setGrade(
  enrollmentId: string,
  value: number,
): Promise<Grade> {
  return parseGrade(
    await apiRequest(`/grades/${enrollmentId}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    }),
  )
}

function parseGrade(value: unknown): Grade {
  const record = expectRecord(value, 'calificación')
  const enrollment = expectRecord(record.enrollment, 'inscripción')
  const status = expectString(enrollment.status, 'status')

  if (status !== 'active' && status !== 'cancelled') {
    throw new Error('La API devolvió un estado de inscripción inválido.')
  }

  const student = expectRecord(enrollment.student, 'estudiante')
  const course = expectRecord(enrollment.course, 'curso')

  return {
    id: expectString(record.id, 'id'),
    value: expectNumber(record.value, 'value'),
    updatedAt: expectString(record.updatedAt, 'updatedAt'),
    enrollment: {
      id: expectString(enrollment.id, 'enrollment.id'),
      status,
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
    },
  }
}
