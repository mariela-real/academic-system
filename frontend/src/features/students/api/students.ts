import {
  apiRequest,
  expectArray,
  expectRecord,
  expectString,
} from '../../../shared/api/client'

export type Student = {
  id: string
  userId: string
  studentNumber: string
  fullName: string
  email: string
}

export async function getStudents(): Promise<Student[]> {
  return expectArray(await apiRequest('/students'), 'estudiantes').map(
    parseStudent,
  )
}

export async function createStudent(input: {
  userId: string
  studentNumber: string
}): Promise<Student> {
  return parseStudent(
    await apiRequest('/students', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  )
}

function parseStudent(value: unknown): Student {
  const record = expectRecord(value, 'estudiante')

  return {
    id: expectString(record.id, 'id'),
    userId: expectString(record.userId, 'userId'),
    studentNumber: expectString(record.studentNumber, 'studentNumber'),
    fullName: expectString(record.fullName, 'fullName'),
    email: expectString(record.email, 'email'),
  }
}
