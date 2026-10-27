import {
  apiRequest,
  expectArray,
  expectBoolean,
  expectRecord,
  expectString,
} from '../../../shared/api/client'

export type AcademicPeriod = {
  code: string
  enrollmentStartsAt: string
  enrollmentEndsAt: string
  enabled: boolean
}

export async function getAcademicPeriods(): Promise<AcademicPeriod[]> {
  return expectArray(
    await apiRequest('/academic-periods'),
    'gestiones académicas',
  ).map(parseAcademicPeriod)
}

export async function createAcademicPeriod(
  input: AcademicPeriod,
): Promise<AcademicPeriod> {
  return parseAcademicPeriod(
    await apiRequest('/academic-periods', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  )
}

export async function updateAcademicPeriod(
  code: string,
  input: Partial<Omit<AcademicPeriod, 'code'>>,
): Promise<AcademicPeriod> {
  return parseAcademicPeriod(
    await apiRequest(`/academic-periods/${encodeURIComponent(code)}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
  )
}

function parseAcademicPeriod(value: unknown): AcademicPeriod {
  const record = expectRecord(value, 'gestión académica')

  return {
    code: expectString(record.code, 'code'),
    enrollmentStartsAt: expectString(
      record.enrollmentStartsAt,
      'enrollmentStartsAt',
    ),
    enrollmentEndsAt: expectString(record.enrollmentEndsAt, 'enrollmentEndsAt'),
    enabled: expectBoolean(record.enabled, 'enabled'),
  }
}
