import {
  apiRequest,
  expectArray,
  expectRecord,
  expectString,
} from '../../../shared/api/client'

export type Subject = {
  id: string
  code: string
  name: string
  description: string | null
}

export type SubjectInput = {
  code: string
  name: string
  description?: string
}

export async function getSubjects(): Promise<Subject[]> {
  return expectArray(await apiRequest('/subjects'), 'materias').map(parseSubject)
}

export async function createSubject(input: SubjectInput): Promise<Subject> {
  return parseSubject(
    await apiRequest('/subjects', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  )
}

export async function updateSubject(
  id: string,
  input: SubjectInput,
): Promise<Subject> {
  return parseSubject(
    await apiRequest(`/subjects/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
  )
}

export async function deleteSubject(id: string): Promise<void> {
  await apiRequest(`/subjects/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

function parseSubject(value: unknown): Subject {
  const record = expectRecord(value, 'materia')

  return {
    id: expectString(record.id, 'id'),
    code: expectString(record.code, 'code'),
    name: expectString(record.name, 'name'),
    description:
      record.description === null
        ? null
        : expectString(record.description, 'description'),
  }
}
