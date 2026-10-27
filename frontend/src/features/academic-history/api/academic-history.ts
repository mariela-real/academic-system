import {
  apiRequest,
  expectArray,
  expectNumber,
  expectRecord,
  expectString,
} from '../../../shared/api/client'

export type AcademicHistory = {
  student: { id: string; studentNumber: string; fullName: string }
  records: Array<{
    enrollmentId: string
    status: 'active' | 'cancelled'
    enrolledAt: string
    course: {
      id: string
      subjectCode: string
      subjectName: string
      academicPeriod: string
    }
    grade: { value: number; updatedAt: string } | null
  }>
}

export async function getOwnAcademicHistory(): Promise<AcademicHistory> {
  return parseAcademicHistory(await apiRequest('/academic-history/me'))
}

export async function getStudentAcademicHistory(
  studentId: string,
): Promise<AcademicHistory> {
  return parseAcademicHistory(
    await apiRequest(`/academic-history/students/${studentId}`),
  )
}

function parseAcademicHistory(value: unknown): AcademicHistory {
  const record = expectRecord(value, 'historial académico')
  const student = expectRecord(record.student, 'estudiante')
  const records = expectArray(record.records, 'registros académicos').map(
    (item) => {
      const historyRecord = expectRecord(item, 'registro académico')
      const course = expectRecord(historyRecord.course, 'curso')
      const status = parseEnrollmentStatus(historyRecord.status)

      const grade =
        historyRecord.grade === null
          ? null
          : parseGrade(historyRecord.grade)

      return {
        enrollmentId: expectString(
          historyRecord.enrollmentId,
          'enrollmentId',
        ),
        status,
        enrolledAt: expectString(historyRecord.enrolledAt, 'enrolledAt'),
        course: {
          id: expectString(course.id, 'course.id'),
          subjectCode: expectString(course.subjectCode, 'course.subjectCode'),
          subjectName: expectString(course.subjectName, 'course.subjectName'),
          academicPeriod: expectString(
            course.academicPeriod,
            'course.academicPeriod',
          ),
        },
        grade,
      }
    },
  )

  return {
    student: {
      id: expectString(student.id, 'student.id'),
      studentNumber: expectString(
        student.studentNumber,
        'student.studentNumber',
      ),
      fullName: expectString(student.fullName, 'student.fullName'),
    },
    records,
  }
}

function parseEnrollmentStatus(value: unknown): 'active' | 'cancelled' {
  const status = expectString(value, 'status')

  if (status !== 'active' && status !== 'cancelled') {
    throw new Error('La API devolvió un estado de inscripción inválido.')
  }

  return status
}

function parseGrade(value: unknown): { value: number; updatedAt: string } {
  const record = expectRecord(value, 'calificación')

  return {
    value: expectNumber(record.value, 'grade.value'),
    updatedAt: expectString(record.updatedAt, 'grade.updatedAt'),
  }
}
